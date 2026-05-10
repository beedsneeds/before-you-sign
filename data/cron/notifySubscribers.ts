import { type ViolationDoc } from '../models/Violation.js';
import { UserModel, type UserDoc } from '../models/User.js';
import { BuildingModel } from '../models/Building.js';
import { NotificationModel } from '../models/Notification.js';
import { sendEmail } from './notifications.js';

const buildEmailHtml = (
  sections: { buildingId: string; address: string; vList: ViolationDoc[] }[],
) => {
  let total = 0;
  for (const s of sections) {
    total += s.vList.length;
  }

  let blocks = '';
  for (const s of sections) {
    let items = '';
    for (const v of s.vList) {
      items += `<li>Class ${v.class}: ${v.description} <em>(${v.currentStatus})</em></li>`;
    }
    const label = s.vList.length === 1 ? 'violation' : 'violations';
    blocks += `<p><strong>${s.address}</strong> picked up ${s.vList.length} new ${label}:</p><ul>${items}</ul>`;
  }

  const totalLabel = total === 1 ? 'violation' : 'violations';
  const buildingLabel = sections.length === 1 ? 'building' : 'buildings';
  return `<p>${total} new ${totalLabel} across ${sections.length} ${buildingLabel} you follow:</p>${blocks}`;
};

export const notifySubscribers = async (newViolations: ViolationDoc[]) => {
  if (newViolations.length === 0) return;

  // Unique building ids touched by these new violations
  const touchedIds = new Set<string>();
  for (const v of newViolations) {
    touchedIds.add(v.buildingId.toString());
  }

  const subscribers = await UserModel.find({ savedBuildings: { $in: [...touchedIds] } });
  if (subscribers.length === 0) return;

  // For each subscriber, build the list of new violations on buildings they follow
  const perUser: { user: UserDoc; vList: ViolationDoc[] }[] = [];
  for (const user of subscribers) {
    const followed = new Set<string>();
    for (const id of user.savedBuildings) {
      followed.add(id.toString());
    }
    const vList: ViolationDoc[] = [];
    for (const v of newViolations) {
      if (followed.has(v.buildingId.toString())) {
        vList.push(v);
      }
    }
    perUser.push({ user, vList });
  }

  // In-app: insertMany across users opted in
  const inAppDocs: { userId: UserDoc['_id']; buildingId: ViolationDoc['buildingId']; violationId: number }[] = [];
  for (const { user, vList } of perUser) {
    if (!user.notificationPrefs.includes('inApp')) continue;
    for (const v of vList) {
      inAppDocs.push({ userId: user._id, buildingId: v.buildingId, violationId: v.violationId });
    }
  }
  if (inAppDocs.length > 0) {
    try {
      await NotificationModel.insertMany(inAppDocs, { ordered: false });
    } catch (err) {
      // ordered:false still inserts the successes, log and continue so email dispatch isn't blocked
      console.error(
        '[notify] inApp insertMany partial failure:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Email: one per user
  const emailUsers: { user: UserDoc; vList: ViolationDoc[] }[] = [];
  for (const { user, vList } of perUser) {
    if (user.notificationPrefs.includes('email')) {
      emailUsers.push({ user, vList });
    }
  }
  if (emailUsers.length === 0) return;

  // Unique building ids referenced in any email
  const referencedIds = new Set<string>();
  for (const { vList } of emailUsers) {
    for (const v of vList) {
      referencedIds.add(v.buildingId.toString());
    }
  }
  const buildings = await BuildingModel.find({ _id: { $in: [...referencedIds] } });

  // Address lookup keyed by id string
  const addressById: Record<string, string> = {};
  for (const b of buildings) {
    addressById[b._id.toString()] = b.address;
  }

  for (const { user, vList } of emailUsers) {
    // Group this user's violations into sections by building (Map for O(1) lookup)
    type Section = { buildingId: string; address: string; vList: ViolationDoc[] };
    const sectionsById = new Map<string, Section>();
    for (const v of vList) {
      const bId = v.buildingId.toString();
      let section = sectionsById.get(bId);
      if (!section) {
        section = {
          buildingId: bId,
          address: addressById[bId] || 'a building you follow',
          vList: [],
        };
        sectionsById.set(bId, section);
      }
      section.vList.push(v);
    }
    const sections = [...sectionsById.values()];

    const subject =
      sections.length === 1
        ? `${vList.length} new violation${vList.length === 1 ? '' : 's'} at ${sections[0]!.address}`
        : `${vList.length} new violations on ${sections.length} of your saved buildings`;
    try {
      await sendEmail({ to: user.email, subject, html: buildEmailHtml(sections) });
    } catch (err) {
      console.error(
        `[notify] email failed user=${user._id}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
};

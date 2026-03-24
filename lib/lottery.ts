import { Registrant, PointsEntry, LotteryConfig, LotteryResultItem, LotteryOutput } from "./types";

function secureShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toResultItem(
  r: Registrant,
  admissionType: LotteryResultItem["admissionType"],
  order: number
): LotteryResultItem {
  return {
    name: r.name,
    phone: r.phone,
    gender: r.gender,
    emergencyName: r.emergencyName,
    emergencyPhone: r.emergencyPhone,
    age: r.age,
    education: r.education,
    admissionType,
    order,
  };
}

export function executeLottery(
  registrants: Registrant[],
  pointsTable: PointsEntry[],
  excludedNames: string[],
  config: LotteryConfig
): LotteryOutput {
  const { totalQuota: n, volunteerSlots: k, waitlistSlots: b, directAdmitNames } = config;
  const results: LotteryResultItem[] = [];
  const excludedSet = new Set(excludedNames.map((name) => name.trim()));

  // Step 0: Filter eligible (exclude past attendees)
  const eligible = registrants.filter((r) => !excludedSet.has(r.name));
  const excludedCount = registrants.length - eligible.length;

  const admittedNames = new Set<string>();
  let orderCounter = 1;

  // Step 1: Direct admission
  const directAdmitSet = new Set(directAdmitNames.map((n) => n.trim()));
  const directAdmits = eligible.filter((r) => directAdmitSet.has(r.name));
  for (const student of directAdmits) {
    results.push(toResultItem(student, "direct", orderCounter++));
    admittedNames.add(student.name);
  }

  let slotsLeft = n - directAdmits.length;

  // Step 2: Lottery exemption
  const pointsMap = new Map(pointsTable.map((p) => [p.name, p.points]));
  const updatedPointsMap = new Map(pointsMap);
  const exemptionCandidates = eligible.filter(
    (r) =>
      !admittedNames.has(r.name) &&
      r.lotteryExemption === "是"
  );

  const exempted: Registrant[] = [];
  for (const candidate of exemptionCandidates) {
    if (slotsLeft <= 0) break;
    const currentPoints = updatedPointsMap.get(candidate.name) ?? 0;
    if (currentPoints >= 2) {
      exempted.push(candidate);
      updatedPointsMap.set(candidate.name, currentPoints - 2);
      admittedNames.add(candidate.name);
      slotsLeft--;
    }
  }

  orderCounter = 1;
  for (const student of exempted) {
    results.push(toResultItem(student, "exemption", orderCounter++));
  }

  // Step 3: Volunteer lottery
  const remaining = eligible.filter((r) => !admittedNames.has(r.name));
  const volunteerPool = remaining.filter(
    (r) => r.volunteerStatus === "樂齡志工" || r.volunteerStatus === "志工團"
  );

  const volunteerDrawCount = Math.min(k, slotsLeft, volunteerPool.length);
  const shuffledVolunteers = secureShuffle(volunteerPool);
  const drawnVolunteers = shuffledVolunteers.slice(0, volunteerDrawCount);
  const undrawnVolunteers = shuffledVolunteers.slice(volunteerDrawCount);

  orderCounter = 1;
  for (const student of drawnVolunteers) {
    results.push(toResultItem(student, "volunteer_lottery", orderCounter++));
    admittedNames.add(student.name);
  }
  slotsLeft -= drawnVolunteers.length;

  // Step 4: General lottery (undrawn volunteers rejoin)
  const nonVolunteers = remaining.filter(
    (r) => !admittedNames.has(r.name) && !volunteerPool.some((v) => v.name === r.name)
  );
  const generalPool = [...undrawnVolunteers, ...nonVolunteers];
  const generalDrawCount = Math.min(slotsLeft, generalPool.length);
  const shuffledGeneral = secureShuffle(generalPool);
  const drawnGeneral = shuffledGeneral.slice(0, generalDrawCount);
  const remainingAfterGeneral = shuffledGeneral.slice(generalDrawCount);

  orderCounter = 1;
  for (const student of drawnGeneral) {
    results.push(toResultItem(student, "general_lottery", orderCounter++));
    admittedNames.add(student.name);
  }

  // Step 5: Waitlist
  const waitlistDrawCount = Math.min(b, remainingAfterGeneral.length);
  const waitlisted = remainingAfterGeneral.slice(0, waitlistDrawCount);

  orderCounter = 1;
  for (const student of waitlisted) {
    results.push(toResultItem(student, "waitlist", orderCounter++));
  }

  // Build updated points list
  const updatedPoints: PointsEntry[] = pointsTable.map((p) => ({
    name: p.name,
    points: updatedPointsMap.get(p.name) ?? p.points,
  }));

  return {
    results,
    updatedPoints,
    stats: {
      totalRegistrants: registrants.length,
      excludedCount,
      eligibleCount: eligible.length,
      directAdmitCount: directAdmits.length,
      exemptionCount: exempted.length,
      volunteerCount: volunteerPool.length,
      volunteerDrawnCount: drawnVolunteers.length,
      generalDrawnCount: drawnGeneral.length,
      waitlistCount: waitlisted.length,
    },
  };
}

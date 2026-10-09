import type { CourseSection, SectionProgress, Unit } from "@/models/types";

export function calculateSectionProgress(section: CourseSection): SectionProgress {
  let completedLessons = 0;
  let totalLessons = 0;

  section.units.forEach((sectionUnit) => {
    sectionUnit.unit.skills.forEach((skill) => {
      skill.lessons.forEach((lesson) => {
        totalLessons += 1;
        if (lesson.is_completed) completedLessons += 1;
      });
    });
  });

  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    completedLessons,
    totalLessons,
    percentage,
    isComplete: totalLessons > 0 && completedLessons >= totalLessons,
  };
}

export function buildCourseSections(units: Unit[] = []): CourseSection[] {
  const orderedUnits = [...units].sort((left, right) => left.unit_number - right.unit_number);
  const sectionCount = 2;
  const unitsPerSection = 3;
  const expectedUnitIds = new Set(orderedUnits.map((unit) => unit.id));
  if (
    orderedUnits.length !== sectionCount * unitsPerSection ||
    expectedUnitIds.size !== orderedUnits.length
  ) {
    throw new Error(
      `Invalid German course structure: expected 6 distinct units, received ${orderedUnits.length}.`,
    );
  }

  const sections: CourseSection[] = Array.from({ length: sectionCount }, (_, sectionIndex) => {
    const sectionId = sectionIndex + 1;
    const sectionUnits = Array.from({ length: unitsPerSection }, (_, unitIndex) => {
      const sourceUnit = orderedUnits[sectionIndex * unitsPerSection + unitIndex];
      return {
        id: `${sectionId}-${unitIndex + 1}`,
        sectionId,
        unitId: unitIndex + 1,
        backendUnitId: sourceUnit.id,
        unit: sourceUnit,
      };
    });

    const section: CourseSection = {
      id: sectionId,
      title: sectionId === 1 ? "Foundations" : "Everyday Communication",
      units: sectionUnits,
      progress: {
        completedLessons: 0,
        totalLessons: 0,
        percentage: 0,
        isComplete: false,
      },
      isLocked: false,
    };

    section.progress = calculateSectionProgress(section);
    return section;
  });

  return sections;
}

export function getDefaultSectionId(sections: CourseSection[] = []): number {
  if (sections.length === 0) return 1;

  const currentSection = sections.find((section) =>
    section.units.some((sectionUnit) =>
      sectionUnit.unit.skills.some(
        (skill) => skill.is_current || (skill.is_unlocked && !skill.is_completed),
      ),
    ),
  );

  return currentSection?.id ?? sections[0].id;
}

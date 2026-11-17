export interface RoleGroup {
  id: string;
  label: string;
  roles: Record<string, string>;
}

export const ROLE_GROUPS: RoleGroup[] = [
  {
    id: "engineering",
    label: "Engineering Roles",
    roles: {
      "junior-software-engineer": "Junior Software Engineer",
      "mid-software-engineer": "Mid-Level Software Engineer",
      "senior-software-engineer": "Senior Software Engineer",
      "staff-software-engineer": "Staff Software Engineer",
    },
  },
  {
    id: "management",
    label: "Project & Program Management",
    roles: {
      "project-manager": "Project Manager",
      "senior-project-manager": "Senior Project Manager",
      "program-manager": "Program Manager",
      "senior-program-manager": "Senior Program Manager",
    },
  },
  {
    id: "leadership",
    label: "Leadership & Executive",
    roles: {
      director: "Director",
      "senior-director": "Senior Director",
      vp: "VP",
      "senior-vp": "Senior VP",
      ceo: "CEO",
    },
  },
  {
    id: "oil",
    label: "Oil & Gas Industry",
    roles: {
      "quality-assurance-and-quality-control-engineer":
        "Quality Assurance and Quality Control (QA/QC) Engineer, Oil and Gas",
      "project-coordinator": "Oil and Gas Project Coordinator",
      "certified-inspector": "Certified Welding Inspector (CWI)",
      "protective-coatings-inspector": "Protective Coatings Inspector",
    },
  },
];

export const INTERVIEW_END_CODE = "end-interview";

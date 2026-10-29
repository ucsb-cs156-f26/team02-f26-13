const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "cgaucho@ucsb.edu",
    teamId: "f26-13",
    tableOrBreakoutRoom: "7",
    requestTime: "2026-10-22T17:35:00",
    explanation: "Need help with Swagger",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "f26-13",
      tableOrBreakoutRoom: "7",
      requestTime: "2026-10-22T17:35:00",
      explanation: "Need help with Swagger",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "ldelplaya@ucsb.edu",
      teamId: "f26-12",
      tableOrBreakoutRoom: "11",
      requestTime: "2026-10-22T18:31:00",
      explanation: "Dokku deployment problem",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "pdg@ucsb.edu",
      teamId: "f26-11",
      tableOrBreakoutRoom: "13",
      requestTime: "2026-10-23T14:15:00",
      explanation: "Need help resolving a merge conflict",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };

const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "req@ucsb.edu",
    professorEmail: "prof@ucsb.edu",
    explanation: "i might be quite homeless",
    dateRequested: "2022-04-03T12:00:00",
    dateNeeded: "2022-04-04T12:00:00",
    done: true,
  },

  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "req@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "i might be quite even more possibly",
      dateRequested: "2022-04-03T12:00:00",
      dateNeeded: "2022-04-04T12:00:00",
      done: true,
    },
    {
      id: 2,
      requesterEmail: "reqer@ucsb.edu",
      professorEmail: "profer@ucsb.edu",
      explanation: "maybe need something sometiem please",
      dateRequested: "2022-05-03T12:00:00",
      dateNeeded: "2022-06-03T12:00:00",
    },
    {
      id: 8,
      requesterEmail: "reqReal@ucsb.edu",
      professorEmail: "profReal@ucsb.edu",
      explanation: "real message very much so",
      dateRequested: "2022-07-03T12:00:00",
      dateNeeded: "2022-08-03T12:00:00",
      done: true,
    },
  ],
};

export { recommendationRequestFixtures };

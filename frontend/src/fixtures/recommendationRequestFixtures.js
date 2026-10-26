const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "req@ucsb.edu?",
    professorEmail: "prof@ucsb,edu",
    explanation: "i might be quite homeless",
    dateRequested: "2022-04-03T12:00:00",
    dateNeeded: "2022-04-03T12:00:00",
    done: true,
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "req@ucsb.edu?",
      professorEmail: "prof@ucsb,edu",
      explanation: "i might be quite homeless",
      dateRequested: "2022-04-03T12:00:00",
      dateNeeded: "2022-04-03T12:00:00",
      done: true,
    },
    {
      id: 2,
      requesterEmail: "req@ucsb.edu?",
      professorEmail: "prof@ucsb,edu",
      explanation: "i might be quite homeless",
      dateRequested: "2022-04-03T12:00:00",
      dateNeeded: "2022-04-03T12:00:00",
    },
    {
      id: 3,
      requesterEmail: "req@ucsb.edu?",
      professorEmail: "prof@ucsb,edu",
      explanation: "i might be quite homeless",
      dateRequested: "2022-04-03T12:00:00",
      dateNeeded: "2022-04-03T12:00:00",
    },
  ],
};

export { recommendationRequestFixtures };

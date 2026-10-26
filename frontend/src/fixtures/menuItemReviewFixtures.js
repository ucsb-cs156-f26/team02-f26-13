const menuItemReviewFixtures = {
  oneReview: {
    id : 1,
    itemId: 5,
    reviewerEmail : "user@example.com",
    stars: 5,
    dateReviewed: "2022-04-20T12:00:00",
    comments: "Great food!",
  },

  threeReviews: [
    {
        id : 2,
      itemId: 5,
      reviewerEmail : "user@example.com",
      stars: 3,
      dateReviewed: "2022-04-20T12:00:00",
      comments: "decent food!",
    },
    {
        id :3,
      itemId: 3,
      reviewerEmail : "anotheruser@example.com",
      stars: 4,
      dateReviewed: "2022-04-21T12:00:00",
      comments: "Good food, but expensive.",
    },
    {
        id : 4,
        itemId: 4,
        reviewerEmail : "bob@gmail.com",
        stars: 1,
        dateReviewed: "2022-04-22T12:00:00",
        comments: "I've had worse out of a toilet.",
    } 
    ]
};

export { menuItemReviewFixtures};

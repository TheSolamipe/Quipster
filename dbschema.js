let db = {
    users: [
        {
            userId: 'hdyeudhgvfd78id',
            email: 'user@gmail.com',
            handle: 'user',
            createdAt: '2020-04-15T10:59:54.789Z',
            imageUrl: 'image/dhfufujfcvn/dchfjf',
            bio: 'Hello, im the biggest and greatest user',
            website: 'https://user.com',
            location: 'London, UK'
        }
    ],
    quips : [
        {
            userHandle: 'user',
            body: 'this is the quip body',
            createdAt: '2021-03-07T12:42:01.018Z',
            likeCount: 5,
            commentCount: 3
        }
    ],
    comments: [
        {
            userHandle: 'user',
            quipId: 'fhfgifjgfnbndfk',
            body: 'how do you think like this',
            createdAt: '2021-03-07T12:42:01.018Z',
        }
    ],
    notifications: [
        {
            recipient: 'user',
            sender: 'john',
            read: 'true | false',
            screamId: 'kdggrifvnvkd5dkfj',
            type: 'like | comment',
            createdAt: '2019-03-15T10:59:52.789Z'
        }
    ]
};

const userDetails = {
    //redux data
    credentials: {
        userId: 'NR4RFVJGJGJNV877',
        email: 'user1@gmail.com',
        handle: 'user1',
        createdAt: '2021-03-07T12:42:01.018Z',
        imageUrl: 'image/dhfufujfcvn/dchfjf',
        bio: 'Hello, im the biggest and greatest user',
        website: 'https://user.com',
        location: 'London, UK'
    },
    likes: [
        {
        userHandle: 'user',
        quipId: 'fhfggfjbfdfj2'
    },
    {
        userHandle: 'user2',
        quipId: 'fhfggfjbfdfj2'
    }]
}
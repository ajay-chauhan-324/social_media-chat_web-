/* Data pools for realistic Indian demo content. */

export const FIRST_NAMES = [
  'Ajay', 'Rahul', 'Priya', 'Sneha', 'Arjun', 'Aditi', 'Neha', 'Karan', 'Riya', 'Vivek',
  'Rohit', 'Ananya', 'Dev', 'Pooja', 'Aman', 'Simran', 'Harsh', 'Nikhil', 'Muskan', 'Yash',
  'Ishaan', 'Kavya', 'Aarav', 'Diya', 'Krishna', 'Meera', 'Siddharth', 'Tanvi', 'Rohan', 'Sanya',
  'Manish', 'Shreya', 'Varun', 'Nidhi', 'Akash', 'Isha', 'Gaurav', 'Payal', 'Sahil', 'Anjali',
  'Raj', 'Divya', 'Aryan', 'Sakshi', 'Kunal', 'Ritu', 'Abhishek', 'Preeti', 'Vikram', 'Swati',
  'Naman', 'Aishwarya', 'Tushar', 'Bhavya', 'Parth', 'Jhanvi', 'Sagar', 'Komal', 'Deepak', 'Nisha',
];

export const LAST_NAMES = [
  'Chauhan', 'Patel', 'Sharma', 'Verma', 'Singh', 'Desai', 'Gupta', 'Shah', 'Kapoor', 'Kumar',
  'Yadav', 'Joshi', 'Mehta', 'Mishra', 'Kaur', 'Jain', 'Reddy', 'Nair', 'Iyer', 'Chopra',
  'Malhotra', 'Bhatt', 'Agarwal', 'Rao', 'Menon', 'Pillai', 'Bose', 'Das', 'Sinha', 'Chatterjee',
];

export const CITIES = [
  ['Mumbai', 'Maharashtra'], ['Ahmedabad', 'Gujarat'], ['Bengaluru', 'Karnataka'],
  ['Delhi', 'Delhi'], ['Pune', 'Maharashtra'], ['Hyderabad', 'Telangana'],
  ['Chennai', 'Tamil Nadu'], ['Kolkata', 'West Bengal'], ['Jaipur', 'Rajasthan'],
  ['Surat', 'Gujarat'], ['Lucknow', 'Uttar Pradesh'], ['Indore', 'Madhya Pradesh'],
  ['Chandigarh', 'Punjab'], ['Kochi', 'Kerala'], ['Nagpur', 'Maharashtra'],
  ['Bhopal', 'Madhya Pradesh'], ['Vadodara', 'Gujarat'], ['Noida', 'Uttar Pradesh'],
];

export const ROLES = [
  { headline: 'React Developer', skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'Tailwind'] },
  { headline: 'Full Stack Developer', skills: ['Node.js', 'MongoDB', 'React', 'Express', 'AWS'] },
  { headline: 'UI/UX Designer', skills: ['Figma', 'UI Design', 'Prototyping', 'Design Systems'] },
  { headline: 'Photographer', skills: ['Photography', 'Lightroom', 'Photoshop', 'Editing'] },
  { headline: 'Startup Founder', skills: ['Leadership', 'Product', 'Growth', 'Fundraising'] },
  { headline: 'AI/ML Engineer', skills: ['Python', 'PyTorch', 'LLMs', 'Data Science'] },
  { headline: 'Computer Science Student', skills: ['DSA', 'C++', 'Java', 'Open Source'] },
  { headline: 'Content Creator', skills: ['Video', 'Storytelling', 'Editing', 'Branding'] },
  { headline: 'Backend Engineer', skills: ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'] },
  { headline: 'Product Designer', skills: ['Figma', 'UX Research', 'Wireframing'] },
];

export const BIOS = [
  'React Developer from {city} 🚀',
  'UI Designer | Coffee Lover ☕',
  'Full Stack Developer | Open Source contributor',
  'Traveller | Photographer 📸',
  'AI Enthusiast building the future 🤖',
  'Startup Founder | Building in public',
  'Software Engineer @ dreams',
  'Fitness lover 💪 | Early riser',
  'Nature explorer 🌿 | Weekend hiker',
  'Food blogger 🍜 | Always hungry',
  'Digital creator ✨ | Storyteller',
  'Turning caffeine into code ☕→💻',
  'Designing delightful experiences',
  'Learning something new every day 📚',
  'Cricket fanatic 🏏 | Dev by day',
  'Sharing my journey in tech 🌱',
];

export const POST_TEMPLATES = {
  tech: [
    'Just shipped a new feature using {tag}! The developer experience keeps getting better. #{tag} #coding',
    'Hot take: {tag} has completely changed how I build apps. Anyone else feel the same? #webdev',
    'Spent the weekend refactoring our codebase. Clean architecture pays off long-term 🧹 #{tag}',
    '10 things I wish I knew before learning {tag}. A thread 🧵 #{tag} #programming',
    'Debugging for 3 hours only to find a missing semicolon. Classic 😅 #developerlife',
  ],
  react: [
    'React 19 features are 🔥 — the new hooks make state management so clean! #react #frontend',
    'useMemo vs useCallback — finally wrote a guide that actually makes sense. #react #javascript',
    'Building a design system in React + Tailwind. Reusable components = happiness. #react #tailwind',
  ],
  ai: [
    'AI is not going to replace developers. Developers using AI will replace those who don\'t. #ai #future',
    'Built a chatbot with the OpenAI API this weekend. The possibilities are endless 🤯 #ai #openai',
    'Prompt engineering is the new frontend. Change my mind. #ai #machinelearning',
  ],
  photography: [
    'Golden hour never disappoints 🌅 Shot this on my morning walk. #photography #nature',
    'Street photography in the old city. Every corner tells a story 📸 #streetphotography',
    'Experimenting with long exposure shots. Patience is everything. #photography',
  ],
  travel: [
    'Sunrise over the mountains. Some views are worth waking up at 4am for 🏔️ #travel #wanderlust',
    'Backpacking through the hills this week. India is stunningly beautiful 🇮🇳 #travel',
    'Found this hidden cafe with the best view in town ☕ #travel #explore',
  ],
  fitness: [
    'Day 30 of my fitness journey. Consistency > motivation 💪 #fitness #health',
    'Morning run done ✅ Nothing beats that post-workout endorphin rush! #fitness #running',
  ],
  food: [
    'Homemade biryani turned out perfect today 😋 Recipe in comments! #food #foodie',
    'Street food tour of the city 🍜 My heart (and stomach) is full. #food #streetfood',
  ],
  startup: [
    'We just crossed 1000 users! Grateful for everyone who believed early 🙏 #startup #buildinpublic',
    'Fundraising is a full-time job on top of your full-time job. Founders, you are seen. #startup',
    'Shipped our MVP in 6 weeks. Done is better than perfect. #startup #product',
  ],
  motivation: [
    'Your only competition is who you were yesterday. Keep going. 🌟 #motivation',
    'Small steps every day lead to big results. Trust the process. #motivation #growth',
  ],
  life: [
    'Sunday reset: journaling, a long walk, and zero notifications. Highly recommend 🧘',
    'Grateful for the little things today ☀️ #life #gratitude',
  ],
  education: [
    'Finally understood recursion after 3 days. It just clicks eventually 😄 #coding #student',
    'Cracked my first coding interview! Hard work does pay off 🎉 #placement #cs',
  ],
  cricket: [
    'What a match last night! Cricket never fails to give us drama 🏏 #cricket',
    'That last-over finish had me on the edge of my seat! 🔥 #cricket',
  ],
};

export const COMMENTS = [
  'Amazing ❤️', 'Great work 🔥', 'Love this!', 'Very helpful, thanks!', 'Thanks for sharing 🙌',
  'Looks awesome 😍', 'Keep it up 🚀', 'Beautiful shot 📸', 'Where is this place?', 'Nice explanation!',
  'Can you share the source code?', 'This helped me a lot 🙏', 'So inspiring!', 'Well said 👏',
  'Totally agree with this.', 'Underrated take honestly.', 'Saving this for later 🔖', 'Goals! 🔥',
  'Congrats! 🎉', 'How long did this take you?', 'Which stack did you use?', 'Clean and crisp 👌',
  'Been waiting for this!', 'Absolutely stunning 😮', 'This is gold 🥇', 'Needed to hear this today.',
  'Great thread!', 'Bookmarked ✅', 'More of this please 🙏', 'You nailed it!',
];

export const CHAT_MESSAGES = [
  'Hey! How are you? 👋', 'Did you check out the new update?', 'Let\'s catch up this weekend!',
  'That post you shared was 🔥', 'Can you send me the link?', 'Haha 😂 exactly!', 'Working on anything cool?',
  'Congrats on the launch! 🎉', 'Let me know when you\'re free', 'Just saw your latest post, loved it ❤️',
  'Are we still on for the call?', 'Thanks a lot! 🙏', 'That makes sense 👍', 'I\'ll get back to you soon',
  'What do you think about this design?', 'Perfect, sounds good!', 'Long time no talk!', 'Miss the old college days 😄',
  'Sending it over now', 'On my way!', 'Great meeting you today 🤝', 'Let\'s collaborate on something!',
];

export const GROUP_NAMES = [
  'ArtROOT Devs', 'Weekend Trekkers', 'React India', 'Startup Founders', 'Design Guild',
  'College Buddies 🎓', 'Fitness Squad 💪', 'Photography Club 📸', 'Foodies United 🍜', 'Cricket Fans 🏏',
];

export const AI_PROMPTS = [
  { tool: 'caption', q: 'Write an Instagram caption for a sunset beach photo', a: '🌅 Chasing horizons and collecting moments. The sky put on a show tonight — grateful for golden hours and salty air. #sunsetlover #beachvibes #goldenhour' },
  { tool: 'assistant', q: 'Explain React hooks in simple terms', a: 'React hooks are functions that let you "hook into" React features from function components. `useState` lets you add state, `useEffect` runs side effects after render, and `useContext` reads shared context. They must be called at the top level of your component, never inside loops or conditions.' },
  { tool: 'assistant', q: 'Fix my JavaScript: why is my array map not updating state?', a: 'You\'re likely mutating state directly. Instead of modifying the array in place, return a new array: `setItems(prev => prev.map(i => i.id === id ? { ...i, done: true } : i))`. React needs a new reference to detect the change and re-render.' },
  { tool: 'hashtags', q: 'Generate hashtags for a fitness transformation post', a: '#fitnessjourney #transformation #fitindia #workoutmotivation #healthylifestyle #gymlife #fitfam #progressnotperfection #strongernotskinnier #fitnessgoals' },
  { tool: 'resume', q: 'Improve this resume bullet: made a website for a client', a: 'Designed and deployed a responsive client website using React and Node.js, improving page-load speed by 40% and increasing user engagement by 25%.' },
  { tool: 'translate', q: 'Translate "Good morning, have a great day!" to Hindi', a: 'सुप्रभात, आपका दिन शुभ हो! (Suprabhaat, aapka din shubh ho!)' },
  { tool: 'assistant', q: 'Write a LinkedIn post about completing a coding bootcamp', a: '🎓 Thrilled to share that I\'ve completed an intensive full-stack bootcamp! Over the last 6 months I built 12 projects, learned React, Node.js, and MongoDB, and grew more than I imagined. Grateful to my mentors and cohort. Excited for what\'s next! #opentowork #webdevelopment' },
  { tool: 'summarize', q: 'Summarize the benefits of using MongoDB', a: 'MongoDB is a flexible NoSQL database that stores data as JSON-like documents. Key benefits: schema flexibility for rapid iteration, horizontal scaling via sharding, powerful aggregation pipelines, and native support in the MERN stack for seamless JavaScript end-to-end.' },
  { tool: 'bio', q: 'Write a short professional bio for a UI designer', a: 'UI/UX Designer crafting delightful, accessible digital experiences. I turn complex problems into clean, intuitive interfaces — one pixel at a time. ☕ + Figma = happy.' },
  { tool: 'assistant', q: 'Give me career advice for a junior developer', a: 'Focus on fundamentals over frameworks — they outlast trends. Build projects you actually care about, contribute to open source for real-world code review, and learn to read others\' code. Communication and consistency will take you further than any single skill.' },
];

export const REPORT_REASONS = ['spam', 'harassment', 'nudity', 'misinformation', 'hate', 'other'];
export const REPORT_DETAILS = [
  'This looks like spam / promotional content.',
  'Inappropriate language in the comments.',
  'Possibly misleading information.',
  'Duplicate / repetitive posting.',
  'Reported for review by the community.',
];

import mysql from 'mysql2/promise';

// Comprehensive verse collection organized by themes
const verses = [
  // Hope & Future (January 8-20)
  { verseText: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.", reference: "Jeremiah 29:11", date: "2026-01-08" },
  { verseText: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.", reference: "Proverbs 3:5-6", date: "2026-01-09" },
  { verseText: "I can do all things through him who strengthens me.", reference: "Philippians 4:13", date: "2026-01-10" },
  { verseText: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1", date: "2026-01-11" },
  { verseText: "Be strong and courageous. Do not fear or be in dread of them, for it is the LORD your God who goes with you. He will not leave you or forsake you.", reference: "Deuteronomy 31:6", date: "2026-01-12" },
  { verseText: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", reference: "Romans 8:28", date: "2026-01-13" },
  { verseText: "They who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.", reference: "Isaiah 40:31", date: "2026-01-14" },
  { verseText: "The LORD bless you and keep you; the LORD make his face to shine upon you and be gracious to you; the LORD lift up his countenance upon you and give you peace.", reference: "Numbers 6:24-26", date: "2026-01-15" },
  { verseText: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", reference: "John 3:16", date: "2026-01-16" },
  { verseText: "The LORD is my light and my salvation; whom shall I fear? The LORD is the stronghold of my life; of whom shall I be afraid?", reference: "Psalm 27:1", date: "2026-01-17" },
  { verseText: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.", reference: "Joshua 1:9", date: "2026-01-18" },
  { verseText: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", reference: "Matthew 6:33", date: "2026-01-19" },
  { verseText: "Come to me, all who labor and are heavy laden, and I will give you rest.", reference: "Matthew 11:28", date: "2026-01-20" },

  // Faith & Trust (January 21 - February 5)
  { verseText: "Now faith is the assurance of things hoped for, the conviction of things not seen.", reference: "Hebrews 11:1", date: "2026-01-21" },
  { verseText: "And without faith it is impossible to please him, for whoever would draw near to God must believe that he exists and that he rewards those who seek him.", reference: "Hebrews 11:6", date: "2026-01-22" },
  { verseText: "For we walk by faith, not by sight.", reference: "2 Corinthians 5:7", date: "2026-01-23" },
  { verseText: "Jesus said to him, 'If you can believe, all things are possible to him who believes.'", reference: "Mark 9:23", date: "2026-01-24" },
  { verseText: "So faith comes from hearing, and hearing through the word of Christ.", reference: "Romans 10:17", date: "2026-01-25" },
  { verseText: "And Jesus said to them, 'Because of your little faith. For truly, I say to you, if you have faith like a grain of mustard seed, you will say to this mountain, Move from here to there, and it will move, and nothing will be impossible for you.'", reference: "Matthew 17:20", date: "2026-01-26" },
  { verseText: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.", reference: "Ephesians 2:8", date: "2026-01-27" },
  { verseText: "The righteous shall live by faith.", reference: "Romans 1:17", date: "2026-01-28" },
  { verseText: "But let him ask in faith, with no doubting, for the one who doubts is like a wave of the sea that is driven and tossed by the wind.", reference: "James 1:6", date: "2026-01-29" },
  { verseText: "Fight the good fight of the faith. Take hold of the eternal life to which you were called.", reference: "1 Timothy 6:12", date: "2026-01-30" },
  { verseText: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me.", reference: "Galatians 2:20", date: "2026-01-31" },
  { verseText: "And he said to her, 'Daughter, your faith has made you well; go in peace, and be healed of your disease.'", reference: "Mark 5:34", date: "2026-02-01" },
  { verseText: "For everyone who has been born of God overcomes the world. And this is the victory that has overcome the world—our faith.", reference: "1 John 5:4", date: "2026-02-02" },
  { verseText: "Looking to Jesus, the founder and perfecter of our faith, who for the joy that was set before him endured the cross, despising the shame, and is seated at the right hand of the throne of God.", reference: "Hebrews 12:2", date: "2026-02-03" },
  { verseText: "But you, beloved, building yourselves up in your most holy faith and praying in the Holy Spirit, keep yourselves in the love of God.", reference: "Jude 1:20-21", date: "2026-02-04" },
  { verseText: "I have fought the good fight, I have finished the race, I have kept the faith.", reference: "2 Timothy 4:7", date: "2026-02-05" },

  // Love & Compassion (February 6-20)
  { verseText: "A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another.", reference: "John 13:34", date: "2026-02-06" },
  { verseText: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful.", reference: "1 Corinthians 13:4-5", date: "2026-02-07" },
  { verseText: "Beloved, let us love one another, for love is from God, and whoever loves has been born of God and knows God.", reference: "1 John 4:7", date: "2026-02-08" },
  { verseText: "There is no fear in love, but perfect love casts out fear.", reference: "1 John 4:18", date: "2026-02-09" },
  { verseText: "And above all these put on love, which binds everything together in perfect harmony.", reference: "Colossians 3:14", date: "2026-02-10" },
  { verseText: "Love one another with brotherly affection. Outdo one another in showing honor.", reference: "Romans 12:10", date: "2026-02-11" },
  { verseText: "Greater love has no one than this, that someone lay down his life for his friends.", reference: "John 15:13", date: "2026-02-12" },
  { verseText: "So now faith, hope, and love abide, these three; but the greatest of these is love.", reference: "1 Corinthians 13:13", date: "2026-02-13" },
  { verseText: "We love because he first loved us.", reference: "1 John 4:19", date: "2026-02-14" },
  { verseText: "Let all that you do be done in love.", reference: "1 Corinthians 16:14", date: "2026-02-15" },
  { verseText: "But God shows his love for us in that while we were still sinners, Christ died for us.", reference: "Romans 5:8", date: "2026-02-16" },
  { verseText: "And walk in love, as Christ loved us and gave himself up for us, a fragrant offering and sacrifice to God.", reference: "Ephesians 5:2", date: "2026-02-17" },
  { verseText: "Hatred stirs up strife, but love covers all offenses.", reference: "Proverbs 10:12", date: "2026-02-18" },
  { verseText: "Love does no wrong to a neighbor; therefore love is the fulfilling of the law.", reference: "Romans 13:10", date: "2026-02-19" },
  { verseText: "And may the Lord make you increase and abound in love for one another and for all.", reference: "1 Thessalonians 3:12", date: "2026-02-20" },

  // Peace & Comfort (February 21 - March 10)
  { verseText: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.", reference: "John 14:27", date: "2026-02-21" },
  { verseText: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.", reference: "Philippians 4:6-7", date: "2026-02-22" },
  { verseText: "You keep him in perfect peace whose mind is stayed on you, because he trusts in you.", reference: "Isaiah 26:3", date: "2026-02-23" },
  { verseText: "Blessed are the peacemakers, for they shall be called sons of God.", reference: "Matthew 5:9", date: "2026-02-24" },
  { verseText: "For he himself is our peace, who has made us both one and has broken down in his flesh the dividing wall of hostility.", reference: "Ephesians 2:14", date: "2026-02-25" },
  { verseText: "Now may the Lord of peace himself give you peace at all times in every way.", reference: "2 Thessalonians 3:16", date: "2026-02-26" },
  { verseText: "And let the peace of Christ rule in your hearts, to which indeed you were called in one body. And be thankful.", reference: "Colossians 3:15", date: "2026-02-27" },
  { verseText: "For to set the mind on the flesh is death, but to set the mind on the Spirit is life and peace.", reference: "Romans 8:6", date: "2026-02-28" },
  { verseText: "The LORD gives strength to his people; the LORD blesses his people with peace.", reference: "Psalm 29:11", date: "2026-03-01" },
  { verseText: "Great peace have those who love your law; nothing can make them stumble.", reference: "Psalm 119:165", date: "2026-03-02" },
  { verseText: "I have said these things to you, that in me you may have peace. In the world you will have tribulation. But take heart; I have overcome the world.", reference: "John 16:33", date: "2026-03-03" },
  { verseText: "Therefore, since we have been justified by faith, we have peace with God through our Lord Jesus Christ.", reference: "Romans 5:1", date: "2026-03-04" },
  { verseText: "Turn away from evil and do good; seek peace and pursue it.", reference: "Psalm 34:14", date: "2026-03-05" },
  { verseText: "For the kingdom of God is not a matter of eating and drinking but of righteousness and peace and joy in the Holy Spirit.", reference: "Romans 14:17", date: "2026-03-06" },
  { verseText: "Strive for peace with everyone, and for the holiness without which no one will see the Lord.", reference: "Hebrews 12:14", date: "2026-03-07" },
  { verseText: "May grace and peace be multiplied to you in the knowledge of God and of Jesus our Lord.", reference: "2 Peter 1:2", date: "2026-03-08" },
  { verseText: "And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.", reference: "Philippians 4:7", date: "2026-03-09" },
  { verseText: "Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need.", reference: "Hebrews 4:16", date: "2026-03-10" },

  // Strength & Courage (March 11-25)
  { verseText: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.", reference: "Isaiah 40:31", date: "2026-03-11" },
  { verseText: "The LORD is my strength and my shield; in him my heart trusts, and I am helped.", reference: "Psalm 28:7", date: "2026-03-12" },
  { verseText: "Finally, be strong in the Lord and in the strength of his might.", reference: "Ephesians 6:10", date: "2026-03-13" },
  { verseText: "God is our refuge and strength, a very present help in trouble.", reference: "Psalm 46:1", date: "2026-03-14" },
  { verseText: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.'", reference: "2 Corinthians 12:9", date: "2026-03-15" },
  { verseText: "The LORD is my strength and my song, and he has become my salvation.", reference: "Exodus 15:2", date: "2026-03-16" },
  { verseText: "He gives power to the faint, and to him who has no might he increases strength.", reference: "Isaiah 40:29", date: "2026-03-17" },
  { verseText: "I can do all things through him who strengthens me.", reference: "Philippians 4:13", date: "2026-03-18" },
  { verseText: "The name of the LORD is a strong tower; the righteous man runs into it and is safe.", reference: "Proverbs 18:10", date: "2026-03-19" },
  { verseText: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", reference: "2 Timothy 1:7", date: "2026-03-20" },
  { verseText: "The joy of the LORD is your strength.", reference: "Nehemiah 8:10", date: "2026-03-21" },
  { verseText: "Be watchful, stand firm in the faith, act like men, be strong.", reference: "1 Corinthians 16:13", date: "2026-03-22" },
  { verseText: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.", reference: "Isaiah 41:10", date: "2026-03-23" },
  { verseText: "But the Lord is faithful. He will establish you and guard you against the evil one.", reference: "2 Thessalonians 3:3", date: "2026-03-24" },
  { verseText: "And after you have suffered a little while, the God of all grace, who has called you to his eternal glory in Christ, will himself restore, confirm, strengthen, and establish you.", reference: "1 Peter 5:10", date: "2026-03-25" },

  // Wisdom & Guidance (March 26 - April 10)
  { verseText: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.", reference: "James 1:5", date: "2026-03-26" },
  { verseText: "The fear of the LORD is the beginning of wisdom, and the knowledge of the Holy One is insight.", reference: "Proverbs 9:10", date: "2026-03-27" },
  { verseText: "For the LORD gives wisdom; from his mouth come knowledge and understanding.", reference: "Proverbs 2:6", date: "2026-03-28" },
  { verseText: "Get wisdom; get insight; do not forget, and do not turn away from the words of my mouth.", reference: "Proverbs 4:5", date: "2026-03-29" },
  { verseText: "The beginning of wisdom is this: Get wisdom, and whatever you get, get insight.", reference: "Proverbs 4:7", date: "2026-03-30" },
  { verseText: "For wisdom will come into your heart, and knowledge will be pleasant to your soul.", reference: "Proverbs 2:10", date: "2026-03-31" },
  { verseText: "I will instruct you and teach you in the way you should go; I will counsel you with my eye upon you.", reference: "Psalm 32:8", date: "2026-04-01" },
  { verseText: "Your word is a lamp to my feet and a light to my path.", reference: "Psalm 119:105", date: "2026-04-02" },
  { verseText: "But the wisdom from above is first pure, then peaceable, gentle, open to reason, full of mercy and good fruits, impartial and sincere.", reference: "James 3:17", date: "2026-04-03" },
  { verseText: "Oh, the depth of the riches and wisdom and knowledge of God! How unsearchable are his judgments and how inscrutable his ways!", reference: "Romans 11:33", date: "2026-04-04" },
  { verseText: "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom.", reference: "Colossians 3:16", date: "2026-04-05" },
  { verseText: "Teach us to number our days that we may get a heart of wisdom.", reference: "Psalm 90:12", date: "2026-04-06" },
  { verseText: "The wise of heart will receive commandments, but a babbling fool will come to ruin.", reference: "Proverbs 10:8", date: "2026-04-07" },
  { verseText: "Whoever walks with the wise becomes wise, but the companion of fools will suffer harm.", reference: "Proverbs 13:20", date: "2026-04-08" },
  { verseText: "How much better to get wisdom than gold! To get understanding is to be chosen rather than silver.", reference: "Proverbs 16:16", date: "2026-04-09" },
  { verseText: "The heart of the wise makes his speech judicious and adds persuasiveness to his lips.", reference: "Proverbs 16:23", date: "2026-04-10" },

  // Joy & Gratitude (April 11-25)
  { verseText: "This is the day that the LORD has made; let us rejoice and be glad in it.", reference: "Psalm 118:24", date: "2026-04-11" },
  { verseText: "Rejoice in the Lord always; again I will say, rejoice.", reference: "Philippians 4:4", date: "2026-04-12" },
  { verseText: "The joy of the LORD is your strength.", reference: "Nehemiah 8:10", date: "2026-04-13" },
  { verseText: "May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.", reference: "Romans 15:13", date: "2026-04-14" },
  { verseText: "You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore.", reference: "Psalm 16:11", date: "2026-04-15" },
  { verseText: "Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.", reference: "1 Thessalonians 5:16-18", date: "2026-04-16" },
  { verseText: "These things I have spoken to you, that my joy may be in you, and that your joy may be full.", reference: "John 15:11", date: "2026-04-17" },
  { verseText: "Count it all joy, my brothers, when you meet trials of various kinds.", reference: "James 1:2", date: "2026-04-18" },
  { verseText: "A joyful heart is good medicine, but a crushed spirit dries up the bones.", reference: "Proverbs 17:22", date: "2026-04-19" },
  { verseText: "Shout for joy to the LORD, all the earth. Worship the LORD with gladness; come before him with joyful songs.", reference: "Psalm 100:1-2", date: "2026-04-20" },
  { verseText: "Give thanks to the LORD, for he is good, for his steadfast love endures forever.", reference: "Psalm 136:1", date: "2026-04-21" },
  { verseText: "Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!", reference: "Psalm 100:4", date: "2026-04-22" },
  { verseText: "Oh give thanks to the LORD; call upon his name; make known his deeds among the peoples!", reference: "Psalm 105:1", date: "2026-04-23" },
  { verseText: "Giving thanks always and for everything to God the Father in the name of our Lord Jesus Christ.", reference: "Ephesians 5:20", date: "2026-04-24" },
  { verseText: "And whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him.", reference: "Colossians 3:17", date: "2026-04-25" },

  // Prayer & Worship (April 26 - May 10)
  { verseText: "Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.", reference: "1 Thessalonians 5:16-18", date: "2026-04-26" },
  { verseText: "And when you pray, you must not be like the hypocrites. For they love to stand and pray in the synagogues and at the street corners, that they may be seen by others.", reference: "Matthew 6:5", date: "2026-04-27" },
  { verseText: "But when you pray, go into your room and shut the door and pray to your Father who is in secret. And your Father who sees in secret will reward you.", reference: "Matthew 6:6", date: "2026-04-28" },
  { verseText: "And whatever you ask in prayer, you will receive, if you have faith.", reference: "Matthew 21:22", date: "2026-04-29" },
  { verseText: "The prayer of a righteous person has great power as it is working.", reference: "James 5:16", date: "2026-04-30" },
  { verseText: "And this is the confidence that we have toward him, that if we ask anything according to his will he hears us.", reference: "1 John 5:14", date: "2026-05-01" },
  { verseText: "Call to me and I will answer you, and will tell you great and hidden things that you have not known.", reference: "Jeremiah 33:3", date: "2026-05-02" },
  { verseText: "Pray then like this: Our Father in heaven, hallowed be your name.", reference: "Matthew 6:9", date: "2026-05-03" },
  { verseText: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.", reference: "Philippians 4:6", date: "2026-05-04" },
  { verseText: "The LORD is near to all who call on him, to all who call on him in truth.", reference: "Psalm 145:18", date: "2026-05-05" },
  { verseText: "Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need.", reference: "Hebrews 4:16", date: "2026-05-06" },
  { verseText: "Likewise the Spirit helps us in our weakness. For we do not know what to pray for as we ought, but the Spirit himself intercedes for us with groanings too deep for words.", reference: "Romans 8:26", date: "2026-05-07" },
  { verseText: "Therefore, confess your sins to one another and pray for one another, that you may be healed.", reference: "James 5:16", date: "2026-05-08" },
  { verseText: "Is anyone among you suffering? Let him pray. Is anyone cheerful? Let him sing praise.", reference: "James 5:13", date: "2026-05-09" },
  { verseText: "Praying at all times in the Spirit, with all prayer and supplication.", reference: "Ephesians 6:18", date: "2026-05-10" },
];

async function seedVerses() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log(`Starting to seed ${verses.length} verses...`);
    
    // Clear existing verses to avoid duplicates
    await connection.query('DELETE FROM daily_verses');
    console.log('Cleared existing verses');
    
    // Insert all verses
    for (const verse of verses) {
      await connection.query(
        'INSERT INTO daily_verses (verseText, reference, date) VALUES (?, ?, ?)',
        [verse.verseText, verse.reference, verse.date]
      );
    }
    
    console.log(`✅ Successfully seeded ${verses.length} verses`);
    
    // Show date range
    const [result] = await connection.query(
      'SELECT MIN(date) as earliest, MAX(date) as latest, COUNT(*) as total FROM daily_verses'
    );
    console.log(`\nVerse coverage:`);
    console.log(`  Earliest: ${result[0].earliest}`);
    console.log(`  Latest: ${result[0].latest}`);
    console.log(`  Total verses: ${result[0].total}`);
    
  } catch (error) {
    console.error('Error seeding verses:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedVerses().catch(console.error);

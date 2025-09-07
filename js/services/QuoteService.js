/**
 * Quote Service
 * Manages waifu quotes and tooltip display logic
 */

export class QuoteService {
  constructor(logger) {
    this.logger = logger;
    this.quotes = [
      "Kyaa~ You're working so hard! (◕‿◕)♡",
      "Don't forget to take breaks, nya~! ♪(´▽｀)",
      "You're doing amazing! Keep it up! ✧･ﾟ: *✧･ﾟ:*",
      "Ehehe~ I believe in you! (｡◕‿◕｡)",
      "Ganbatte kudasai! Fighting~! ٩(◕‿◕)۶",
      "You're my favorite human! ♡(˃͈ દ ˂͈ ༶ )",
      "Uwaa~ So productive today! (＾◡＾)",
      "Your hard work makes me happy! ♡⃛◟( ˊ̱˂˃ˋ̱ )◞⸜₍ ˍ́˱˲ˍ̀ ₎⸝◟( ˊ̱˂˃ˋ̱ )◞♡⃛",
      "Let's do our best together! ☆ﾐ(o*･ω･)ﾉ",
      "I'm cheering you on! Go go go~! \\(^o^)/",
      "Sugoi desu ne~! You're incredible! (๑˃̵ᴗ˂̵)و",
      "Time for a little break? Tea time! ☕️ (*´▽`*)",
      "Your dedication is inspiring! ♡(˃͈ દ ˂͈ ༶ )",
      "Nya nya~ Keep being awesome! =^._.^= ∫",
      "I'm so proud of you! ♪ヽ(´▽｀)/",
      "Working hard or hardly working? Ehehe~ (´∀｀)♡",
      "You light up my day! ✨(◕‿◕)✨",
      "Kawaii productivity mode activated! ♡( ◡ ‿ ◡ )",
      "Remember: you're doing great! (｡♥‿♥｡)",
      "Motto motto~! A little more! ♪(´ε｀ )"
    ];
    
    this.moodQuotes = {
      happy: [
        "Yay! I'm so happy today! ♪(´▽｀)",
        "Everything is wonderful when you're here! ♡",
        "Happiness level: Maximum! ✧･ﾟ: *✧･ﾟ:*",
        "Today is the best day ever! (◕‿◕)♡"
      ],
      neutral: [
        "Just another peaceful day~ (´∀｀)",
        "How are you feeling today? ♪",
        "Let's make today special! ☆",
        "Ready for whatever comes our way! ♡"
      ],
      sad: [
        "Don't worry, tomorrow will be better... (´；ω；`)",
        "I'm here for you, always... ♡",
        "Even sad days can have beautiful moments...",
        "Let's take it one step at a time... ♪"
      ]
    };
  }

  getRandomQuote(mood = null) {
    let quoteArray;
    
    if (mood && this.moodQuotes[mood]) {
      quoteArray = this.moodQuotes[mood];
      this.logger.log(`Getting ${mood} mood quote`);
    } else {
      quoteArray = this.quotes;
    }
    
    const randomIndex = Math.floor(Math.random() * quoteArray.length);
    const quote = quoteArray[randomIndex];
    
    this.logger.log(`Selected quote: ${quote}`);
    return quote;
  }

  getQuoteByEvent(eventType) {
    const eventQuotes = {
      taskComplete: [
        "Yatta! Task completed! ♪(´▽｀)",
        "Amazing work! You did it! ✧･ﾟ: *✧･ﾟ:*",
        "One more down! You're on fire! ♡",
        "Sugoi! Keep up the momentum! ٩(◕‿◕)۶"
      ],
      waifuClick: [
        "Kyaa~ That tickles! (◕‿◕)♡",
        "Ehehe~ You're so sweet! ♪",
        "More headpats please! (｡◕‿◕｡)",
        "I love your attention! ♡⃛"
      ],
      newTask: [
        "Ooh, a new adventure! ☆",
        "Let's tackle this together! ♪",
        "I believe you can do it! ♡",
        "Another chance to shine! ✧"
      ]
    };

    if (eventQuotes[eventType]) {
      const quotes = eventQuotes[eventType];
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    }

    return this.getRandomQuote();
  }

  getAllQuotes() {
    return [...this.quotes];
  }

  addCustomQuote(quote) {
    if (quote && quote.trim()) {
      this.quotes.push(quote.trim());
      this.logger.log(`Added custom quote: ${quote}`);
      return true;
    }
    return false;
  }
}

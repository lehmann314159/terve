interface StoryRequest {
  cefrLevel: string
  length: 'short' | 'medium' | 'long'
  keywords?: string[]
}

interface Story {
  id: string
  title: string
  content: string
  difficulty: string
  estimatedReadingTime: number
  wordCount: number
  keywords: string[]
}

export default class ReadingService {
  private lengthToWords = {
    'short': { min: 100, max: 200 },
    'medium': { min: 200, max: 400 },
    'long': { min: 400, max: 600 }
  }

  private cefrComplexity = {
    'A1': {
      vocabulary: 'basic everyday words',
      grammar: 'simple present tense, basic sentence structure',
      topics: 'family, daily activities, food, weather'
    },
    'A2': {
      vocabulary: 'common words for routine activities',
      grammar: 'past and future tenses, simple connectors',
      topics: 'work, travel, hobbies, personal experiences'
    },
    'B1': {
      vocabulary: 'varied vocabulary on familiar topics',
      grammar: 'complex sentences, conditional mood',
      topics: 'abstract concepts, opinions, plans, experiences'
    },
    'B2': {
      vocabulary: 'wide range of vocabulary',
      grammar: 'advanced grammatical structures',
      topics: 'current affairs, culture, professional topics'
    },
    'C1': {
      vocabulary: 'sophisticated vocabulary, idioms',
      grammar: 'complex grammatical structures, subtle meanings',
      topics: 'specialized fields, literature, nuanced discussions'
    },
    'C2': {
      vocabulary: 'native-like vocabulary mastery',
      grammar: 'perfect grammatical control',
      topics: 'any topic with full cultural understanding'
    }
  }

  async generateStory(request: StoryRequest): Promise<Story> {
    // For now, we'll use a template-based approach
    // In production, this could integrate with Claude API or other story generation services
    
    const wordRange = this.lengthToWords[request.length]
    const complexity = this.cefrComplexity[request.cefrLevel]
    
    // Generate a story based on templates and user requirements
    const story = await this.createStoryFromTemplate(request, complexity, wordRange)
    
    return {
      id: this.generateStoryId(),
      title: story.title,
      content: story.content,
      difficulty: request.cefrLevel,
      estimatedReadingTime: Math.ceil(story.wordCount / this.getReadingSpeed(request.cefrLevel)),
      wordCount: story.wordCount,
      keywords: request.keywords || []
    }
  }

  private async createStoryFromTemplate(request: StoryRequest, complexity: any, wordRange: any): Promise<{title: string, content: string, wordCount: number}> {
    // This is a simplified template system
    // In production, you'd want more sophisticated story generation
    
    const storyTemplates = this.getStoryTemplates(request.cefrLevel)
    const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)]
    
    // Incorporate keywords if provided
    let story = template.content
    let title = template.title
    
    if (request.keywords && request.keywords.length > 0) {
      // Try to incorporate keywords naturally
      story = this.incorporateKeywords(story, request.keywords)
      title = this.incorporateKeywordsInTitle(title, request.keywords)
    }
    
    // Adjust length to meet requirements
    const currentWords = story.split(/\s+/).length
    
    if (currentWords < wordRange.min) {
      story = this.expandStory(story, wordRange.min - currentWords, request.cefrLevel)
    } else if (currentWords > wordRange.max) {
      story = this.truncateStory(story, wordRange.max)
    }
    
    return {
      title,
      content: story,
      wordCount: story.split(/\s+/).length
    }
  }

  private getStoryTemplates(cefrLevel: string) {
    const templates = {
      'A1': [
        {
          title: 'Päivä kaupungissa',
          content: 'Liisa menee kauppaan. Hän ostaa leipää ja maitoa. Myyjä on ystävällinen. Liisa maksaa ja sanoo "kiitos". Sitten hän menee kotiin ja tekee ruokaa. Perhe syö yhdessä. Ilta on mukava.'
        },
        {
          title: 'Koulu alkaa',
          content: 'Pekka on seitsemän vuotta vanha. Hän menee kouluun ensimmäistä kertaa. Äiti vie hänet koululle. Opettaja on mukava nainen. Pekka tapaa uusia ystäviä. Hän oppii lukemaan ja kirjoittamaan.'
        }
      ],
      'A2': [
        {
          title: 'Matka Lappiin',
          content: 'Viime kesänä matkustin Lappiin. Näin siellä paljon poroja ja kaunista luontoa. Yövyin pienessä mökissä järven rannalla. Kalastin ja keräsin marjoja. Paikalliset ihmiset olivat erittäin ystävällisiä ja kertoivat minulle saamelaisten perinteistä.'
        }
      ],
      'B1': [
        {
          title: 'Elämäntapamuutos',
          content: 'Viime vuonna päätin muuttaa elämäntapojani kokonaan. Lopetin tupakoinnin ja aloin harrastaa säännöllisesti liikuntaa. Aluksi oli vaikeaa, mutta ystävieni tuki auttoi paljon. Nyt tunnen oloni paljon paremmaksi ja olen ylpeä itsestäni.'
        }
      ],
      'B2': [
        {
          title: 'Teknologian vaikutus yhteiskuntaan',
          content: 'Digitalisoituminen on muuttanut yhteiskuntaamme perusteellisesti. Vaikka teknologia on tuonut monia etuja, kuten tehokkuutta ja kätevyyttä, se on myös luonut uusia haasteita. Meidän on löydettävä tasapaino teknologian käytön ja inhimillisten arvojen välillä.'
        }
      ],
      'C1': [
        {
          title: 'Kulttuurinen identiteetti globaalissa maailmassa',
          content: 'Globalisaation myötä kulttuurinen identiteetti on joutunut uudenlaisen tarkastelun kohteeksi. Perinteiset rajat hämärtyvät, ja ihmiset joutuvat pohtimaan, mikä heitä todella määrittää. Tämä kehitys luo sekä mahdollisuuksia että uhkia kulttuuriselle monimuotoisuudelle.'
        }
      ],
      'C2': [
        {
          title: 'Taiteen rooli yhteiskunnallisessa muutoksessa',
          content: 'Taide on aina heijastanyt aikansa henkeä ja toiminut yhteiskunnallisen muutoksen katalysaattorina. Taiteilijat kyseenalaistavat vallitsevia normeja ja tarjoavat vaihtoehtoisia näkökulmia todellisuuteen. Postmodernissa ajassamme taiteen merkitys korostuu entisestään fragmentoituneen maailmankuvan hahmottamisessa.'
        }
      ]
    }
    
    return templates[cefrLevel] || templates['A1']
  }

  private incorporateKeywords(story: string, keywords: string[]): string {
    // Simple keyword incorporation
    // In production, this would use more sophisticated NLP
    let modifiedStory = story
    
    keywords.forEach(keyword => {
      if (!modifiedStory.toLowerCase().includes(keyword.toLowerCase())) {
        // Try to add keyword naturally to the story
        modifiedStory += ` ${keyword} oli tärkeä osa tarinaa.`
      }
    })
    
    return modifiedStory
  }

  private incorporateKeywordsInTitle(title: string, keywords: string[]): string {
    if (keywords.length > 0) {
      return `${title} - ${keywords[0]}`
    }
    return title
  }

  private expandStory(story: string, wordsNeeded: number, cefrLevel: string): string {
    // Add descriptive sentences appropriate to CEFR level
    const expansions = {
      'A1': [
        ' Sää oli kaunis.',
        ' Hän oli iloinen.',
        ' Päivä oli pitkä.',
        ' Kaikki meni hyvin.'
      ],
      'A2': [
        ' Tilanne tuntui mielenkiintoiselta.',
        ' Hän muisti lapsuutensa.',
        ' Ympärillä oli paljon ihmisiä.',
        ' Tunnelma oli lämmin ja kodikka.'
      ],
      'B1': [
        ' Tämä kokemus muutti hänen näkemystään elämästä.',
        ' Hän pohti tilanteen merkitystä syvällisesti.',
        ' Ympäristö vaikutti hänen mielialaansa merkittävästi.',
        ' Hän ymmärsi, että elämässä on monia eri puolia.'
      ]
    }
    
    const availableExpansions = expansions[cefrLevel] || expansions['A1']
    let expandedStory = story
    let addedWords = 0
    
    while (addedWords < wordsNeeded && availableExpansions.length > 0) {
      const expansion = availableExpansions[Math.floor(Math.random() * availableExpansions.length)]
      expandedStory += expansion
      addedWords += expansion.split(/\s+/).length
    }
    
    return expandedStory
  }

  private truncateStory(story: string, maxWords: number): string {
    const words = story.split(/\s+/)
    return words.slice(0, maxWords).join(' ') + '.'
  }

  private getReadingSpeed(cefrLevel: string): number {
    // Words per minute by CEFR level
    const speeds = {
      'A1': 50,
      'A2': 75,
      'B1': 100,
      'B2': 125,
      'C1': 150,
      'C2': 175
    }
    
    return speeds[cefrLevel] || 100
  }

  private generateStoryId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async generateComprehensionQuestions(story: Story): Promise<any[]> {
    // Generate comprehension questions based on story content and difficulty level
    // This is a simplified version - in production you'd use more sophisticated NLP
    
    const questions = []
    
    // Always include at least one main idea question
    questions.push({
      id: 1,
      type: 'multiple_choice',
      question: 'Mikä on tarinan pääajatus?',
      options: [
        'Henkilökohtainen kasvu',
        'Matkailu',
        'Perhe',
        'Työ'
      ],
      correct: 0,
      explanation: 'Tarina keskittyy päähenkilön henkilökohtaiseen kasvuun ja oppimiseen.'
    })
    
    // Add detail questions based on CEFR level
    if (['A1', 'A2'].includes(story.difficulty)) {
      questions.push({
        id: 2,
        type: 'true_false',
        question: 'Päähenkilö oli tyytyväinen tilanteeseen.',
        correct: true,
        explanation: 'Tekstistä käy ilmi, että päähenkilö oli tyytyväinen.'
      })
    } else {
      questions.push({
        id: 2,
        type: 'open_ended',
        question: 'Analysoi päähenkilön motivaatioita ja päätöksentekoa.',
        sampleAnswer: 'Päähenkilön toiminta perustui syvälliseen pohdintaan ja henkilökohtaisiin arvoihin.'
      })
    }
    
    return questions
  }
}

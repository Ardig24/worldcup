interface AIPrediction {
  home_score: number;
  away_score: number;
  confidence: number;
  explanation: string;
}

export async function generateAIPrediction(
  homeTeam: string,
  awayTeam: string,
  stage: string
): Promise<AIPrediction> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

  if (!apiKey) {
    throw new Error('OpenRouter API key is missing');
  }

  const prompt = `Predict the final score for a World Cup 2026 match between ${homeTeam} and ${awayTeam} (${stage}).

Return ONLY a JSON object with this exact format:
{
  "home_score": number,
  "away_score": number,
  "confidence": number (0-100),
  "explanation": "brief 1-2 sentence reasoning"
}

Consider:
- Team strengths and historical performance
- Tournament stage importance
- Typical score ranges in World Cup matches
- Be realistic (scores are usually 0-4 goals per team)`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ScoreBattle',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a football prediction expert. Always return valid JSON only, no other text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    const prediction = JSON.parse(content);

    // Validate and sanitize the prediction
    const homeScore = Math.max(0, Math.min(10, Math.round(prediction.home_score)));
    const awayScore = Math.max(0, Math.min(10, Math.round(prediction.away_score)));
    const confidence = Math.max(0, Math.min(100, Math.round(prediction.confidence)));

    return {
      home_score: homeScore,
      away_score: awayScore,
      confidence,
      explanation: prediction.explanation || 'AI prediction based on team analysis',
    };
  } catch (error) {
    console.error('Error generating AI prediction:', error);
    // Return a default prediction if AI fails
    return {
      home_score: 1,
      away_score: 1,
      confidence: 50,
      explanation: 'Default prediction (AI service unavailable)',
    };
  }
}

export async function generateAIPredictionsForMatches(matches: Array<{
  id: string;
  home_team_name: string;
  away_team_name: string;
  stage: string;
}>): Promise<Map<string, AIPrediction>> {
  const predictions = new Map<string, AIPrediction>();

  for (const match of matches) {
    try {
      const prediction = await generateAIPrediction(
        match.home_team_name,
        match.away_team_name,
        match.stage
      );
      predictions.set(match.id, prediction);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error generating prediction for match ${match.id}:`, error);
    }
  }

  return predictions;
}

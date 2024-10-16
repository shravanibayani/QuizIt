from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
import requests, json
from decouple import config

ACCOUNT_ID = config('ACCOUNT_ID')
API_KEY = config('API_TOKEN')


def get_transcript(url):
    print("YouTube URL received:", url)
    vd1 = url.split('=')[1]
    video_id = vd1.split('&')[0]

    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(
            video_id, languages=['en'])
    except NoTranscriptFound:
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(
                video_id, languages=['en-IN', 'hi'])
        except NoTranscriptFound as e:
            print(f"No transcript found for the video: {e}")
            return "No transcript available."

    transcript = " ".join([d['text'] for d in transcript_list])
    return transcript


def quiz_generator(transcript):
    prompt = f"""
    Based on the following educational transcript, generate 5 creative multiple-choice questions (MCQs).
    Each MCQ should have exactly 4 options, with one correct answer, in the following format:
    
    Respond only with valid JSON. Do not write an introduction or summary.

    Example JSON format:
    [
    {{
        "question": "What is the capital of India?",
        "option_1": "Mumbai",
        "option_2": "Pune",
        "option_3": "New Delhi",
        "option_4": "Chennai",
        "correct_answer": "option_3"
    }},
    {{
        "question": "Which river flows through Paris?",
        "option_1": "Thames",
        "option_2": "Seine",
        "option_3": "Nile",
        "option_4": "Amazon",
        "correct_answer": "option_2"
    }},
    ... (3 more questions)
    ]

    Transcript: {transcript}
    """
    
    response = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-70b-instruct",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "messages": [
                {"role": "system", "content": "You are a friendly assistant"},
                {"role": "user", "content": prompt}
            ]
        }
    )

    if response.status_code == 200:
        try:
            result_json = response.json()

            if 'result' in result_json and 'response' in result_json['result']:
                generated_quiz_str = result_json['result']['response']

                if not generated_quiz_str:
                    print("Empty response received from the API.")
                    return None

                quiz = json.loads(generated_quiz_str)
                return quiz
            
            else:
                print("The expected 'result' or 'response' fields are missing.")
                return None

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            print(f"Raw response content: {response.text}")
            return None
        except KeyError as e:
            print(f"KeyError in response parsing: {e}")
            print(f"Full response: {response.json()}")
            return None
    else:
        print(f"Failed to generate quiz, status code: {response.status_code}")
        print(f"Error details: {response.text}")
        return None


# test
# transcipt = get_transcript('https://www.youtube.com/watch?v=fgm5uZaS3-E')
# quiz = quiz_generator(transcipt)
# print(quiz)

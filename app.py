from flask import Flask, request
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)

@app.route('/')
def app_home():
    return "Welcome to the home page"

@app.route('/getquiz', methods=['GET'])
def get_quiz():
    video_id = id_generator()  
    transcript = get_transcript(video_id)  
    return transcript

def id_generator():
    url = request.args.get('url')  
    print("YouTube URL received:", url)
    vd1 = url.split('=')[1]
    video_id = vd1.split('&')[0]  
    return video_id

from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound

def get_transcript(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
    except NoTranscriptFound:
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en-IN', 'hi'])
        except NoTranscriptFound as e:
            print(f"No transcript found for the video: {e}")
            return "No transcript available."

    transcript = " ".join([d['text'] for d in transcript_list])
    return transcript


if __name__ == '__main__':
    app.run(debug=True, port=5000)

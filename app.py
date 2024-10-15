from flask import Flask, request
from helpers import get_transcript, quiz_generator

app = Flask(__name__)

@app.route('/getquiz', methods=['GET'])
def get_quiz():
    url = request.args.get('url')
    transcript = get_transcript(url)  
    quiz = quiz_generator(transcript)
    if quiz:
        return quiz
    else:
        return 'Could not generate the quiz :('

if __name__ == '__main__':
    app.run(debug=True, port=5000)


'''
To do 
- need to check the category of the video before generaing the quiz
- only generate the quiz for education category videos which are in english language
- we also need to do the error handling better
'''
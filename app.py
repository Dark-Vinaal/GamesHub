from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Available options
OPTIONS = ["rock", "paper", "scissor"]

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/game/rps')
def rps_game():
    return render_template('game.html')

@app.route('/play', methods=['POST'])
def play():
    data = request.json
    user_choice = data.get('choice')
    
    if not user_choice or user_choice not in OPTIONS:
        return jsonify({'error': 'Invalid choice'}), 400
    
    computer_choice = random.choice(OPTIONS)
    
    result = ""
    if user_choice == computer_choice:
        result = "Draw"
    elif (user_choice == "rock" and computer_choice == "scissor") or \
         (user_choice == "scissor" and computer_choice == "paper") or \
         (user_choice == "paper" and computer_choice == "rock"):
        result = "You Win!"
    else:
        result = "Computer Wins!"
        
    return jsonify({
        'user_choice': user_choice,
        'computer_choice': computer_choice,
        'result': result
    })

if __name__ == '__main__':
    app.run(debug=True)

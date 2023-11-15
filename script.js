let timer;
let timeRemaining = 30;
let score = 0;
let combo = 0;
let difficulty = 1;
let isGameRunning = false;
let hintUsed = false;
let bonusRoundActive = false;
let bonusRoundTime = 10;

function startGame() {
  isGameRunning = true;
  hintUsed = false;
  bonusRoundActive = false;
  combo = 0;
  difficulty = 1;
  updateFoodTitle();
  generateIngredients();
  updateTimer();
  timer = setInterval(updateTimer, 1000);
  startCountdown();
}

function viewHighScores() {
  window.location.href = 'highscores.html';
}

function updateHighScores() {
  const highscoreList = document.getElementById('highscore-list');
  // Retrieve and display high scores from storage or an API
  // Example: highscoreList.innerHTML = '<li>Player1 - Score: 100</li><li>Player2 - Score: 90</li>';
}

function updateFoodTitle() {
  const foodTitle = document.getElementById('food-title');
  const foodOptions = ['Pizza', 'Burger', 'Sushi', 'Pasta', 'Salad', 'Tacos', 'Ice Cream', 'Smoothie'];
  const randomFood = foodOptions[Math.floor(Math.random() * foodOptions.length)];
  foodTitle.textContent = `👩‍🍳 ${randomFood} Challenge`;
}

function generateIngredients() {
  const ingredientsContainer = document.getElementById('ingredients-container');
  ingredientsContainer.innerHTML = '';

  const difficultyFactors = [1, 2, 3]; // Adjust difficulty levels as needed

  for (let i = 0; i < (bonusRoundActive ? 4 : 3); i++) {
    const randomIndex = Math.floor(Math.random() * difficultyFactors.length);
    const ingredientDifficulty = difficultyFactors[randomIndex];
    const ingredient = getIngredientByDifficulty(ingredientDifficulty);

    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient';
    ingredientDiv.innerHTML = `
      <input type="checkbox" id="ingredient${i}" class="ingredient-checkbox">
      <label for="ingredient${i}">${ingredient}</label>
    `;

    ingredientsContainer.appendChild(ingredientDiv);
  }
}

function getIngredientByDifficulty(difficulty) {
  const ingredients = {
    1: ['🍅 Tomatoes', '🥦 Broccoli', '🍤 Shrimp', '🧀 Cheese'],
    2: ['🍕 Pizza', '🍔 Burger', '🍣 Sushi', '🍝 Pasta'],
    3: ['🥩 Steak', '🍖 BBQ Ribs', '🍗 Fried Chicken', '🍜 Ramen']
  };

  const randomIndex = Math.floor(Math.random() * ingredients[difficulty].length);
  return ingredients[difficulty][randomIndex];
}

function updateTimer() {
  const timeElement = document.getElementById('time');
  timeElement.textContent = timeRemaining;

  if (timeRemaining <= 0) {
    endGame();
  } else {
    timeRemaining--;

    if (bonusRoundActive) {
      updateProgressBar();
    }
  }
}

function startCountdown() {
  const startCountdownElement = document.getElementById('start-countdown');
  let countdown = 3;

  const countdownInterval = setInterval(() => {
    startCountdownElement.textContent = countdown;
    countdown--;

    if (countdown < 0) {
      clearInterval(countdownInterval);
      startCountdownElement.style.display = 'none';
    }
  }, 1000);
}

function submitGuess() {
  if (!isGameRunning) return;

  const selectedIngredients = document.querySelectorAll('.ingredient-checkbox:checked');
  const correctIngredients = bonusRoundActive ? ['ingredient0', 'ingredient1', 'ingredient2', 'ingredient3'] : ['ingredient0', 'ingredient1', 'ingredient2'];

  const isCorrect = Array.from(selectedIngredients).every(ingredient => correctIngredients.includes(ingredient.id));

  if (isCorrect) {
    if (bonusRoundActive) {
      score += 2 * difficulty * (combo + 1); // Double points for bonus round, multiplied by combo
      combo++;
    } else {
      score += difficulty * (combo + 1);
      combo++;
    }
    document.getElementById('score-value').textContent = score;
    document.getElementById('combo').textContent = combo;
  } else {
    // Incorrect guess, reset combo
    combo = 0;
    document.getElementById('combo').textContent = combo;

    // Penalty for incorrect guess
    timeRemaining = Math.max(0, timeRemaining - 3);

    // Display hint history
    const selectedIngredient = selectedIngredients.length > 0 ? selectedIngredients[0].nextSibling.textContent : 'Unknown';
    displayHintHistory(selectedIngredient);
  }

  playSound(isCorrect ? 'correct.mp3' : 'incorrect.mp3');
  generateIngredients();
  if (!bonusRoundActive && score % 5 === 0) {
    startBonusRound();
  }
  updateUI();
}

function startBonusRound() {
  bonusRoundActive = true;
  bonusRoundTime = 10;
  updateProgressBar();
  setTimeout(endBonusRound, bonusRoundTime * 1000);
  generateIngredients();
}

function endBonusRound() {
  bonusRoundActive = false;
  updateDifficulty();
  generateIngredients();
}

function updateDifficulty() {
  difficulty = Math.min(3, Math.ceil(score / 10)); // Increase difficulty every 10 points, capped at 3
  document.getElementById('difficulty').textContent = difficulty;
}

function updateProgressBar() {
  const progressBarInner = document.getElementById('progress-bar-inner');
  const progress = (bonusRoundTime - timeRemaining) / bonusRoundTime * 100;
  progressBarInner.style.width = `${progress}%`;
}

function getHint() {
  if (!isGameRunning || hintUsed) return;

  hintUsed = true;
  const hintBtn = document.getElementById('hint-btn');
  hintBtn.disabled = true;

  const correctIngredients = bonusRoundActive ? ['ingredient0', 'ingredient1', 'ingredient2', 'ingredient3'] : ['ingredient0', 'ingredient1', 'ingredient2'];

  const hintIngredient = correctIngredients[Math.floor(Math.random() * correctIngredients.length)];
  const hintLabel = document.querySelector(`label[for=${hintIngredient}]`);
  hintLabel.style.color = '#ff5722'; // Highlight the hint
}

function endGame() {
  clearInterval(timer);
  isGameRunning = false;
  const gameOverMessageElement = document.getElementById('game-over-message');
  gameOverMessageElement.textContent = `Game over! Your score is ${score}`;
  gameOverMessageElement.style.display = 'block';
  playSound('game-over.mp3');
  resetGame();
}

function resetGame() {
  timeRemaining = 30;
  score = 0;
  combo = 0;
  difficulty = 1;
  updateProgressBar();
  document.getElementById('score-value').textContent = score;
  document.getElementById('combo').textContent = combo;
  document.getElementById('difficulty').textContent = difficulty;
  document.getElementById('hint-btn').disabled = false;
  document.getElementById('game-over-message').style.display = 'none';
  startGame();
}

function startGaming() {
    window.location.href = 'game.html';
  }

function toggleDarkMode() {
  const body = document.body;
  const gameContainer = document.getElementById('game-container');
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');

  body.classList.toggle('dark-mode');
  gameContainer.classList.toggle('dark-mode');

  // Save user preference in local storage
  localStorage.setItem('dark-mode', darkModeCheckbox.checked);
}

function playSound(soundFile) {
  const audio = new Audio(soundFile);
  audio.play();
}

// Apply dark mode preference from local storage
const darkModePreference = localStorage.getItem('dark-mode') === 'true';
if (darkModePreference) {
  toggleDarkMode();
}

// Start the game when the page loads
window.onload = startGame;

const hintList = document.getElementById('hint-list');

function skipRound() {
  if (!isGameRunning) return;

  playSound('skip.mp3');
  generateIngredients();
  endBonusRound(); // End bonus round if active
  updateDifficulty();
}

function applyPowerUp(type) {
  if (!isGameRunning) return;

  playSound('power-up.mp3');
  switch (type) {
    case 'time':
      timeRemaining += 5;
      break;
    case 'score':
      score *= 2;
      break;
    case 'hint':
      hintUsed = false;
      document.getElementById('hint-btn').disabled = false;
      break;
  }

  updateUI();
}

function updateUI() {
  document.getElementById('time').textContent = timeRemaining;
  document.getElementById('score-value').textContent = score;
}

function displayHintHistory(ingredient) {
  const hintItem = document.createElement('li');
  hintItem.textContent = `Hint: ${ingredient}`;
  hintList.appendChild(hintItem);
}

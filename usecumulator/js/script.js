/*
 * If you're reading this, I apologize for the the substandard code.
 * It's my first JavaScript project.
 */
var recalculateTimes = 0;
var resultsMaxSavings = [];
var resultsMinSteps = [];

// Set constants
var FUEL_PRICE = parseFloat(document.getElementById('fuel-price').value);
var MAX_DISCOUNTED_LITRES = parseFloat(document.getElementById('max-discounted-litres').value);
var DISCOUNT_APPLIES_SPEND = parseFloat(document.getElementById('discount-applies-spend').value);
var DISCOUNT_AMOUNT = parseFloat(document.getElementById('discount-amount').value / 100); 

// Declare variables and initial states
var maxFuel = document.getElementById('max-fuel').value;
var remainingFuel = document.getElementById('remaining-fuel').value;
document.getElementById('remaining-fuel-p').value = (remainingFuel / maxFuel * 100).toFixed(2);

var usedFuel = document.getElementById('used-fuel').value;
document.getElementById('used-fuel').value = maxFuel - remainingFuel;
document.getElementById('used-fuel-p').value = ((maxFuel - remainingFuel) / maxFuel * 100).toFixed(2);

var initialDiscountAmount = parseFloat(document.getElementById('initial-discount-amount').value / 100);
var accumulatedDiscountAmount;
var minimumFillupLitres = DISCOUNT_APPLIES_SPEND / FUEL_PRICE;

var results = [];

// function to sort
// https://stackoverflow.com/questions/9175268/javascript-sort-function-sort-by-first-then-by-second
function compare(a, b) {
    if (a < b) return +1;
    if (a > b) return -1;
    return 0;
}

// Function to reset parameters.
function resetSimulation() {
  // These need to be the same at the start of each simulation.
  usedFuel = maxFuel - remainingFuel;
  accumulatedDiscountAmount = initialDiscountAmount;
}

function getCurrentVars() {
  // Function to get current state on screen if variables are used in calculations.
  FUEL_PRICE = parseFloat(document.getElementById('fuel-price').value);
  MAX_DISCOUNTED_LITRES = parseFloat(document.getElementById('max-discounted-litres').value);
  DISCOUNT_APPLIES_SPEND = parseFloat(document.getElementById('discount-applies-spend').value);
  DISCOUNT_AMOUNT = parseFloat(document.getElementById('discount-amount').value / 100); 
  maxFuel = parseFloat(document.getElementById('max-fuel').value);
  usedFuel = parseFloat(document.getElementById('used-fuel').value);
  initialDiscountAmount = parseFloat(document.getElementById('initial-discount-amount').value / 100);
  minimumFillupLitres = DISCOUNT_APPLIES_SPEND / FUEL_PRICE;
}

resetSimulation();

/*
 * Strategies in plain text.
 * 
 * 1. Accumulate discounts every fill up and use all on the last fill up.
 * 2. Accumulate discounts every fill up but be sure the last fill up is eligible for discount ($40) and use all the discounts then.
 * 3. Accumulate discounts every fill up until the last <= 50 litres to go.
 * 4. Use discounts every fill up even if the last fill up is not eligible for the discount.
 * 5. Use discounts every fill up but max out the fill on the last <= 50 litres. 
 * 
 */

// No Strategy
function strategy0() {
  resetSimulation();
  results[0] = {
      name: 0,
      strategy: 'Use no discounts.', 
      spend: usedFuel * FUEL_PRICE, 
      savings: 0, 
      steps: 1,
      text: '<li>Fill $' + (usedFuel * FUEL_PRICE).toFixed(2) + ' (' + usedFuel + ' litres) of fuel.</li>'
  };
}

// Strategy 1  
function strategy1() {
  resetSimulation();
  var steps = 0;
  var spend = 0;
  var accumulationRounds = 0;
  var text = '';

  while (accumulationRounds * minimumFillupLitres <= usedFuel) {
    var filledAmount = accumulationRounds * minimumFillupLitres;
    accumulationRounds += 1;
    if (usedFuel - filledAmount <= minimumFillupLitres) {
      accumulationRounds -= 1;
      if (usedFuel - filledAmount == 0) {
        accumulationRounds -= 1;
        break;
      }
      break;
    }
  }

  // accumulation rounds
  for (i = 0; i < accumulationRounds; i++) {
    steps += 1;
    usedFuel -= minimumFillupLitres;
    spend += (minimumFillupLitres * FUEL_PRICE);
    accumulatedDiscountAmount += DISCOUNT_AMOUNT;
    text += '<li>Fill $' + (minimumFillupLitres * FUEL_PRICE).toFixed(2) + ' (' +
      parseFloat(minimumFillupLitres.toFixed(4)) + ' litres) of fuel' + 
      '. <span class="tag is-success is-small">Accumulate</span> ' + (DISCOUNT_AMOUNT*100).toFixed(0) + 
      ' c / litre off. Total accumulated discount is now ' + (accumulatedDiscountAmount*100).toFixed(0) + 
      ' c / litre off.</li>';
  }

  // make discounts zero if no litres of fuel can be discounted
  if (MAX_DISCOUNTED_LITRES == 0) {
    accumulatedDiscountAmount = 0;
  }

  // use round
  steps += 1;
  var savings = parseFloat((accumulatedDiscountAmount * usedFuel).toFixed(2));
  spend += (usedFuel * (FUEL_PRICE - accumulatedDiscountAmount));
  text += '<li>Fill $' + (usedFuel * (FUEL_PRICE)).toFixed(2) + ' (' +
  parseFloat(usedFuel.toFixed(4)) + ' litres) of fuel. <span class="tag is-danger is-small">Use</span> your total accumulated discount of ' + 
    (accumulatedDiscountAmount*100).toFixed(0) + ' c / litre off. You pay' +
    ' $' + (usedFuel * (FUEL_PRICE - accumulatedDiscountAmount)).toFixed(2) +
    ' ($' + savings.toFixed(2) + 
    ' saved).</li>';
  results[1] = {
      name: 1,
      strategy: 'Accumulate discounts at every fill up of the minimum spend ($' + 
        DISCOUNT_APPLIES_SPEND + 
        ') and use up all the discounts on the last fill up.', 
      spend: spend, 
      savings: savings, 
      steps: steps,
      text: text
  };
}

// Strategy 2
function strategy2() {
  resetSimulation();
  var steps = 0;
  var spend = 0;
  var accumulationRounds = 0;
  var text = '';

  while ((usedFuel - (accumulationRounds * minimumFillupLitres)) >= minimumFillupLitres) {
    var filledAmount = accumulationRounds * minimumFillupLitres;
    accumulationRounds += 1;
    if ((usedFuel - (filledAmount + minimumFillupLitres)) < minimumFillupLitres) {
      accumulationRounds -= 1;
      break;
    }
  }

  // accumulation rounds
  for (i = 0; i < accumulationRounds; i++) {
    steps += 1;
    usedFuel -= minimumFillupLitres;
    spend += (minimumFillupLitres * FUEL_PRICE);
    accumulatedDiscountAmount += DISCOUNT_AMOUNT;    
    text += '<li>Fill $' + (minimumFillupLitres * FUEL_PRICE).toFixed(2) + ' (' +
      parseFloat(minimumFillupLitres.toFixed(4)) + ' litres) of fuel' + 
      '. <span class="tag is-success is-small">Accumulate</span> ' + (DISCOUNT_AMOUNT*100).toFixed(0) + 
      ' c / litre off. Total accumulated discount is now ' + (accumulatedDiscountAmount*100).toFixed(0) + 
      ' c / litre off.</li>';
  }

  // use round
  steps += 1;
  accumulatedDiscountAmount += DISCOUNT_AMOUNT;

  // make discounts zero if no litres of fuel can be discounted
  if (MAX_DISCOUNTED_LITRES == 0) {
    accumulatedDiscountAmount = 0;
  }

  var savings = parseFloat((accumulatedDiscountAmount * usedFuel).toFixed(2));
  spend += (usedFuel * (FUEL_PRICE - accumulatedDiscountAmount));
  text += '<li>Fill $' + (usedFuel * (FUEL_PRICE)).toFixed(2) + ' (' +
  parseFloat(usedFuel.toFixed(4)) + ' litres) of fuel. <span class="tag is-danger is-small">Use</span> your total accumulated discount of ' + 
    (accumulatedDiscountAmount*100).toFixed(0) + ' c / litre off. You pay' +
    ' $' + (usedFuel * (FUEL_PRICE - accumulatedDiscountAmount)).toFixed(2) +
    ' ($' + savings.toFixed(2) + 
    ' saved).</li>';
  results[2] = {
      name: 2,
      strategy: 'Accumulate discounts at every fill up of the minimum spend ($' + DISCOUNT_APPLIES_SPEND +
        ') but be sure the last fill up also reaches the minimum spend needed ($' + DISCOUNT_APPLIES_SPEND + ') and use all the discounts then.', 
      spend: spend, 
      savings: savings, 
      steps: steps,
      text: text
  };
}

// Strategy 3
function strategy3() {
  resetSimulation();
  var steps = 0;
  var spend = 0;
  var accumulationRounds = 0;
  var text = '';

  while ((usedFuel - (accumulationRounds * minimumFillupLitres)) >= MAX_DISCOUNTED_LITRES && usedFuel >= minimumFillupLitres) {
        accumulationRounds += 1;
  }

  // accumulation rounds
  for (i = 0; i < accumulationRounds; i++) {
    steps += 1;
    usedFuel -= minimumFillupLitres;
    spend += (minimumFillupLitres * FUEL_PRICE);
    accumulatedDiscountAmount += DISCOUNT_AMOUNT;
    text += '<li>Fill $' + (minimumFillupLitres * FUEL_PRICE).toFixed(2) + ' (' +
      parseFloat(minimumFillupLitres.toFixed(4)) + ' litres) of fuel' + 
      '. <span class="tag is-success is-small">Accumulate</span> ' + (DISCOUNT_AMOUNT*100).toFixed(0) + 
      ' c / litre off. Total accumulated discount is now ' + (accumulatedDiscountAmount*100).toFixed(0) + 
      ' c / litre off.</li>';
  }

  // use round
  steps += 1;
  accumulatedDiscountAmount += DISCOUNT_AMOUNT;

  // make discounts zero if no litres of fuel can be discounted
  if (MAX_DISCOUNTED_LITRES == 0) {
    accumulatedDiscountAmount = 0;
  }

  var savings = parseFloat((accumulatedDiscountAmount * usedFuel).toFixed(2));
  spend += (usedFuel * (FUEL_PRICE - accumulatedDiscountAmount));
  text += '<li>Fill $' + (usedFuel * (FUEL_PRICE)).toFixed(2) + ' (' +
  parseFloat(usedFuel.toFixed(4)) + ' litres) of fuel. <span class="tag is-danger is-small">Use</span> your total accumulated discount of ' + 
    (accumulatedDiscountAmount*100).toFixed(0) + ' c / litre off. You pay' +
    ' $' + (usedFuel * (FUEL_PRICE - accumulatedDiscountAmount)).toFixed(2) +
    ' ($' + savings.toFixed(2) + 
    ' saved).</li>';
  results[3] = {
      name: 3,
      strategy: 'Accumulate discounts at every fill up of the minimum spend ($' + DISCOUNT_APPLIES_SPEND +
        ') but be sure to max out the discount use by making sure the last refuel fits within the maximum litres of fuel that can be discounted (' +
        MAX_DISCOUNTED_LITRES + ' litres).', 
      spend: spend, 
      savings: savings, 
      steps: steps,
      text: text
  };
}

// Strategy 4
function strategy4() {
  resetSimulation();
  var spend = 0;
  var savings = 0;
  var accumulationRounds = 0;
  var fillRounds = 0;
  var text = '';

  while (usedFuel > 0) {
    if (usedFuel >= minimumFillupLitres) {
      fillRounds += 1;
      usedFuel -= minimumFillupLitres;
      accumulatedDiscountAmount += DISCOUNT_AMOUNT;

      // make discountes zero if no litres of fuel can be discounted
      if (MAX_DISCOUNTED_LITRES == 0) {
        accumulatedDiscountAmount = 0;
      }

      spend += (minimumFillupLitres * (FUEL_PRICE - accumulatedDiscountAmount));
      savings += (minimumFillupLitres * accumulatedDiscountAmount);
      text += '<li>Fill $' + (minimumFillupLitres*(FUEL_PRICE)).toFixed(2) + ' (' +
        parseFloat(minimumFillupLitres.toFixed(4)) + ' litres) of fuel. <span class="tag is-danger is-small">Use</span> your total accumulated discount of ' + (accumulatedDiscountAmount*100).toFixed(0) + 
        ' c / litre off. You pay $' + (minimumFillupLitres*(FUEL_PRICE - accumulatedDiscountAmount)).toFixed(2) + ' ($' +
        (accumulatedDiscountAmount * minimumFillupLitres).toFixed(2) + ' saved).' +
        '</li>';
      accumulatedDiscountAmount = 0;
    } else {
      fillRounds += 1;
      spend += (usedFuel * FUEL_PRICE);
      text += '<li>Fill $' + (usedFuel * FUEL_PRICE).toFixed(2) + ' (' +
      parseFloat(usedFuel.toFixed(4)) + ' litres) of fuel. <span class="tag is-danger is-small">Use</span> your total accumulated discount of ' + (accumulatedDiscountAmount*100).toFixed(0) + 
        ' c / litre off. You pay $' + (usedFuel*FUEL_PRICE).toFixed(2) + ' ($' + (accumulatedDiscountAmount * usedFuel).toFixed(2) + ' saved).' +
        '</li>';
      usedFuel -= usedFuel     
    }
  }
  spend = parseFloat(spend.toFixed(2));
  savings = parseFloat(savings.toFixed(2)); 
  results[4] = {
      name: 4,
      strategy: 'Use discounts at every fill up and only fill up to the minimum spend ($' + DISCOUNT_APPLIES_SPEND + ') necessary irregardless of what the last fill up is.', 
      spend: spend, 
      savings: savings, 
      steps: fillRounds,
      text: text
  };
}

//Strategy 5
function strategy5() {
  resetSimulation();
  var spend = 0;
  var savings = 0;
  var accumulationRounds = 0;
  var fillRounds = 0;
  var text = '';

  while (usedFuel > 0) {
    if (usedFuel > MAX_DISCOUNTED_LITRES && usedFuel >= minimumFillupLitres) {
      fillRounds += 1;
      usedFuel -= minimumFillupLitres;
      accumulatedDiscountAmount += DISCOUNT_AMOUNT;

      // make discounts zero if no litres of fuel can be discounted
      if (MAX_DISCOUNTED_LITRES == 0) {
        accumulatedDiscountAmount = 0;
      }

      spend += (minimumFillupLitres * (FUEL_PRICE - accumulatedDiscountAmount));
      savings += (minimumFillupLitres * accumulatedDiscountAmount);
      text += '<li>Fill $' + (minimumFillupLitres*(FUEL_PRICE)).toFixed(2) + ' (' +
        parseFloat(minimumFillupLitres.toFixed(4)) + ' litres) of fuel. <span class="tag is-danger is-small">Use</span> your total accumulated discount of ' + (accumulatedDiscountAmount*100).toFixed(0) + 
        ' c / litre off. You pay $' + (minimumFillupLitres*(FUEL_PRICE - accumulatedDiscountAmount)).toFixed(2) + ' ($' +
        (accumulatedDiscountAmount * minimumFillupLitres).toFixed(2) + ' saved).' +
        '</li>';
      accumulatedDiscountAmount = 0;
    } else {
      fillRounds += 1;
      if (usedFuel * FUEL_PRICE >= DISCOUNT_APPLIES_SPEND) {
        accumulatedDiscountAmount += DISCOUNT_AMOUNT;
      }
      
      // make discounts zero if no litres of fuel can be discounted
      if (MAX_DISCOUNTED_LITRES == 0) {
        accumulatedDiscountAmount = 0;
      }

      spend += (usedFuel * (FUEL_PRICE - accumulatedDiscountAmount));
      savings += (usedFuel * accumulatedDiscountAmount);  
      text += '<li>Fill $' + (usedFuel * FUEL_PRICE).toFixed(2) + ' (' +
      parseFloat(usedFuel.toFixed(4)) + ' litres) of fuel. <span class="tag is-danger is-small">Use</span> your total accumulated discount of ' + (accumulatedDiscountAmount*100).toFixed(0) + 
        ' c / litre off. You pay $' + (usedFuel*(FUEL_PRICE-accumulatedDiscountAmount)).toFixed(2) + ' ($' + (accumulatedDiscountAmount * usedFuel).toFixed(2) + ' saved).' +
        '</li>';
      usedFuel -= usedFuel;
    }
  } 
  spend = parseFloat(spend.toFixed(2));
  savings = parseFloat(savings.toFixed(2)); 
  results[5] = {
      name: 5,
      strategy: 'Use discounts at every fill up of the minimum spend ($' + 
      DISCOUNT_APPLIES_SPEND + 
      ') but be sure to max out the discount use by making sure the last refuel fits within the maximum litres of fuel that can be discounted (' +
      MAX_DISCOUNTED_LITRES +
      ' litres).', 
      spend: spend, 
      savings: savings, 
      steps: fillRounds,
      text: text
    };
}

function calculate() {
  // Clear results box when calculating
  document.getElementById('results-box').textContent = '';

  // Recalculate
  strategy0();
  strategy1();
  strategy2();
  strategy3();
  strategy4();
  strategy5();

  results.sort(function(a, b) {
    return compare(a.savings, b.savings) || compare(b.steps, a.steps)
  });
 
  var save = [];
  var step = [];

  for (i = 0; i < results.length; i++) {
    save.push(results[i]['savings']);
    step.push(results[i]['steps']);
  }

  resultsMaxSavings = Math.max(...save);
  resultsMinSteps = Math.min(...step);

//   console.log(results);
  
  for (i = 0; i < results.length; i++) {
    addToResultsBox(results[i]);
  }
  if (recalculateTimes > 0) {
    dataLayer.push({
      'event': 'recalculate',
      'times': recalculateTimes
    });
  }

}

// Input change recalculations
document.getElementById('max-fuel').addEventListener('input', function(e) {
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  maxFuel = this.value;
  usedFuel = maxFuel - remainingFuel;
  document.getElementById('used-fuel').value = usedFuel;
  document.getElementById('used-fuel-p').value = (usedFuel / maxFuel * 100).toFixed(2);
  document.getElementById('remaining-fuel-p').value = (remainingFuel / maxFuel * 100).toFixed(2);
  getCurrentVars();
  calculate();
});

document.getElementById('remaining-fuel').addEventListener('input', function(e) {
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  remainingFuel = this.value;
  usedFuel = maxFuel - remainingFuel;
  document.getElementById('used-fuel').value = usedFuel;
  document.getElementById('used-fuel-p').value = (usedFuel / maxFuel * 100).toFixed(2);
  document.getElementById('remaining-fuel-p').value = (remainingFuel / maxFuel * 100).toFixed(2);
  getCurrentVars();
  calculate();
});

document.getElementById('remaining-fuel-p').addEventListener('input', function(e) {
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  var remainingFuelP = this.value / 100;
  remainingFuel = maxFuel * remainingFuelP;
  document.getElementById('remaining-fuel').value = remainingFuel;
  usedFuel = maxFuel - remainingFuel;
  document.getElementById('used-fuel').value = usedFuel;
  document.getElementById('used-fuel-p').value = (usedFuel / maxFuel * 100).toFixed(2);
  getCurrentVars();
  calculate();
});

document.getElementById('fuel-price').addEventListener('input', function(e) {
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  if (this.value == null || this.value < 0) {
    FUEL_PRICE = 2;
    document.getElementById('fuel-price').value = 2;
  } else {
    FUEL_PRICE = this.value;
  }
  minimumFillupLitres = DISCOUNT_APPLIES_SPEND / FUEL_PRICE;
  getCurrentVars();
  calculate(); 
});

document.getElementById('initial-discount-amount').addEventListener('input', function(e){
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  initialDiscountAmount = this.value / 100;
  getCurrentVars();
  calculate();
});

document.getElementById('discount-amount').addEventListener('input', function(e){
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  DISCOUNT_AMOUNT = this.value / 100;
  getCurrentVars();
  calculate();
});

document.getElementById('discount-applies-spend').addEventListener('input', function(e) {
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  if (this.value == null || this.value == 0) {
    DISCOUNT_APPLIES_SPEND = 1;
    document.getElementById('discount-applies-spend').value = 1;
  } else {
    DISCOUNT_APPLIES_SPEND = this.value;
  }
  getCurrentVars();
  calculate(); 
});

document.getElementById('max-discounted-litres').addEventListener('input', function(e){
  recalculateTimes += 1;
  var changedItem = this.id;
  console.log(changedItem);
  MAX_DISCOUNTED_LITRES = this.value;
  getCurrentVars();
  calculate();
});

calculate();

function addToResultsBox(resultItem) {
  var nameText = resultItem['name'];
  var strategyText = resultItem['strategy'];  
  var spendText = resultItem['spend'];  
  var savingsText = resultItem['savings'];  
  var stepsText = resultItem['steps'];  
  var textText = resultItem['text'];

  // create the components that make up one result item.
  var divResultsItem = document.createElement('div');
  divResultsItem.className = 'tile box is-child';
  var divContentResultsItem = document.createElement('div');
  divContentResultsItem.className = 'content'

  var p = document.createElement('p');
  p.appendChild(document.createTextNode(strategyText));
 
  var li = document.createElement('ol');
  li.className = 'content is-small';
  li.innerHTML = textText;

  // create field div that contains all the tags.
  var divField = document.createElement('div');
  divField.className = 'field is-grouped is-grouped-multiline';
  
  // add each results variables.
  var tagItems = [nameText, spendText.toFixed(2), savingsText.toFixed(2), stepsText]
  var tagIcons = ['strategy', 'fas fa-dollar-sign', 'fas fa-piggy-bank', 'fas-fa-step-forward'];

    // add strategy tag -------------------------------
    var divControl = document.createElement('div');
    divControl.className = 'control';
    var divTags = document.createElement('div');
    divTags.className = 'tags has-addons';

    // 2 span tags for each tag.
    var spanTag1 = document.createElement('span');
    var spanTag2 = document.createElement('span');

    spanTag1.className = 'tag is-info is-medium';
    spanTag2.className = 'tag is-dark is-medium';

    var text1 = document.createTextNode(tagIcons[0]);
    var text2 = document.createTextNode(tagItems[0]);

    // append
    spanTag1.appendChild(text1);
    spanTag2.appendChild(text2);
    divTags.appendChild(spanTag1);
    divTags.appendChild(spanTag2);
    divControl.appendChild(divTags);
    divField.appendChild(divControl);
    // ---------------------------------------------


    // add spend tag -------------------------------
    var divControl = document.createElement('div');
    divControl.className = 'control';
    var divTags = document.createElement('div');
    divTags.className = 'tags has-addons';

    // 2 span tags for each tag.
    var spanTag1 = document.createElement('span');
    var spanTag2 = document.createElement('span');

    spanTag1.className = 'tag is-info is-medium';
    spanTag2.className = 'tag is-dark is-medium';
       
    var i = document.createElement('i');
    i.className = 'fas fa-dollar-sign';

    var text = document.createTextNode(tagItems[1]);

    // append
    spanTag1.appendChild(i);
    spanTag2.appendChild(text);
    divTags.appendChild(spanTag1);
    divTags.appendChild(spanTag2);
    divControl.appendChild(divTags);
    divField.appendChild(divControl);
    // ---------------------------------------------

    // add savings tag -----------------------------
    var divControl = document.createElement('div');
    divControl.className = 'control';
    var divTags = document.createElement('div');
    divTags.className = 'tags has-addons';

    // 2 span tags for each tag.
    var spanTag1 = document.createElement('span');
    var spanTag2 = document.createElement('span');

    spanTag1.className = 'tag is-info is-medium';
    spanTag2.className = 'tag is-dark is-medium';
       
    var i = document.createElement('i');
    i.className = 'fas fa-piggy-bank';

    var text = document.createTextNode(tagItems[2]);

    // append
    spanTag1.appendChild(i);
    spanTag2.appendChild(text);
    divTags.appendChild(spanTag1);
    divTags.appendChild(spanTag2);
    divControl.appendChild(divTags);
    divField.appendChild(divControl);
    // --------------------------------------------

    // steps --------------------------------------
    var divControl = document.createElement('div');
    divControl.className = 'control';
    var divTags = document.createElement('div');
    divTags.className = 'tags has-addons';

    // 2 span tags for each tag.
    var spanTag1 = document.createElement('span');
    var spanTag2 = document.createElement('span');

    spanTag1.className = 'tag is-info is-medium';
    spanTag2.className = 'tag is-dark is-medium';
       
    var i = document.createElement('i');
    i.className = 'fas fa-step-forward';

    var text = document.createTextNode(tagItems[3]);
    // --------------------------------------------

    // append
    spanTag1.appendChild(i);
    spanTag2.appendChild(text);
    divTags.appendChild(spanTag1);
    divTags.appendChild(spanTag2);
    divControl.appendChild(divTags);
    divField.appendChild(divControl);

  // add text that is printed out to element
  divContentResultsItem.appendChild(divField);
  divContentResultsItem.appendChild(p);
  divContentResultsItem.appendChild(li);
  divResultsItem.appendChild(divContentResultsItem);

  var resultsBox = document.getElementById('results-box');
  resultsBox.appendChild(divResultsItem);
}

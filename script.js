const calsIn100Input = document.querySelector('.calsIn100');
const gramsInput = document.querySelector('.grams');
const myCalsInput = document.querySelector('.myCals');
const memoInput = document.querySelector('input.memo');
const resultDiv = document.querySelector('.result');
const addBtn = document.querySelector('.addBtn');
const rowsUl = document.querySelector('.rowsUl');
const totalDiv = document.querySelector('.total');

let calorieTracker = {
  today: [],
};

let calsIn100 = calsIn100Input.value;
let grams = gramsInput.value;
let myCals = myCalsInput.value;

function updateValues() {
  calsIn100 = calsIn100Input.value;
  grams = gramsInput.value;
  myCals = myCalsInput.value;
}

function myCalsHandler() {
  updateValues();
  if (calsIn100 && myCals) {
    gramsInput.value = Math.floor(100 / (calsIn100 / myCals));
  }
}

function gramsHandler() {
  updateValues();
  if (calsIn100 && grams) {
    myCalsInput.value = Math.ceil(calsIn100 * grams / 100);
  }
}

function addBtnHandler() {
  updateValues();
  calorieTracker.today.push(myCals);
  totalHandler();
  addTodayRow(myCals);
  saveData();
}

function addTodayRow(row) {
  rowsUl.innerHTML = `<li>${row}</li>` + rowsUl.innerHTML;
}

function totalHandler() {
  if (calorieTracker.today.length) {
    totalDiv.innerHTML = calorieTracker.today.reduce((acc, curr) => +acc + +curr);
  }
}

function loadData() {
  let storage = localStorage.getItem('calorieTracker');
  if (storage) {
    calorieTracker = JSON.parse(storage) || {};
  }
}

function saveData() {
  let storage = JSON.stringify(calorieTracker);
  localStorage.setItem('calorieTracker', storage);
}

function atAppStart() { 
  calorieTracker = {
    today: [],
    memo: '',
    calorieHistory: {},
  } 
  loadData();   
  let { today, memo } = calorieTracker;
  today.forEach((row) => addTodayRow(row));
  totalHandler();
  memoHandler(memo);
}

function memoHandler(memo) {
  if (typeof memo === 'string') {
    memo = memo;
    memoInput.value = memo;
  } else {
    memo = memoInput.value;
    calorieTracker.memo = memo;
    saveData();
  }
}

atAppStart();

myCalsInput.addEventListener('keyup', myCalsHandler);
gramsInput.addEventListener('keyup', gramsHandler);
addBtn.addEventListener('click', addBtnHandler);
memoInput.addEventListener('keyup', memoHandler);
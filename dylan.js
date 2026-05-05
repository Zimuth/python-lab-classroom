const h1Dylan = document.getElementById('dylan-text');
const input = document.getElementById('dylan-input');
const button = document.getElementById('dylan-button');

button.addEventListener('click', function () {
  const inputValue = input.value.trim();

  if (inputValue === '') {
    h1Dylan.textContent = '';
    return;
  }

  h1Dylan.textContent = 'Hello ' + inputValue + '!';
});

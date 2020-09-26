export default class TaskForm {
  constructor(parentEl) {
    this.parentEl = parentEl;
    this.bindToDOM();

    this.element = this.parentEl.querySelector('.task-form');
    this.fields = this.element.elements;
    this.addedButton = this.element.querySelector('.added-button');
    this.resetButton = this.element.querySelector('.reset-button');
    this.errors = [];
    this.submitFormListeners = [];
    this.regitsterEvents();
  }

  static get markup() {
    return `<form novalidate class="task-form">
      <button class="added-button">+ Добавить еще одну задачу</button>
      <textarea class="name-input" name="name"></textarea>
      <button class="save-button" type="submit">Добавить</button>
      <button class="reset-button" type="reset">Х</button>
    </form>`;
  }

  bindToDOM() {
    this.parentEl.insertAdjacentHTML('beforeend', this.constructor.markup);
  }

  showForm() {
    this.fields.name.value = '';
    this.element.classList.add('task-form_visible');
  }

  hideForm() {
    this.hideErrors();
    this.element.classList.remove('task-form_visible');
  }

  vildate() {
    this.hideErrors();
    if (this.fields.name.value === '') {
      this.errors.push({
        key: 'name',
        text: 'Поле не может быть пустым',
      });
      return false;
    }
    return true;
  }

  showErrors() {
    this.errors.forEach((error) => {
      const errorEl = document.createElement('div');
      errorEl.classList.add('error');
      errorEl.innerText = error.text;
      this.fields[error.key].after(errorEl);
    });
  }

  hideErrors() {
    this.errors = [];
    const errorsEl = Array.from(this.element.getElementsByClassName('error'));
    errorsEl.forEach((element) => element.remove());
  }

  addSubmitFormListener(callback) {
    this.submitFormListeners.push(callback);
  }

  onSubmitForm(event) {
    event.preventDefault();
    if (this.vildate()) {
      const name = this.fields.name.value;
      this.hideForm();
      this.submitFormListeners.forEach((o) => o.call(null, name, this.parentEl));
    } else this.showErrors();
  }

  onClickResetForm() {
    this.hideForm();
  }

  onClickAddButton(e) {
    e.preventDefault();
    this.showForm();
  }

  regitsterEvents() {
    this.element.addEventListener('submit', this.onSubmitForm.bind(this));
    this.resetButton.addEventListener('click', this.onClickResetForm.bind(this));
    this.addedButton.addEventListener('click', this.onClickAddButton.bind(this));
  }
}

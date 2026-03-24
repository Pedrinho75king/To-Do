const taskBtn = document.querySelector("#taskBtn")
const taskList = document.querySelector("#taskList")
const taskInput = document.querySelector("#taskInput")

taskBtn.addEventListener("click", function(){
    const li = document.createElement('li');
    const taskInputValue = taskInput.value;
     if (taskInputValue == ''){
        return
    }
    const span = document.createElement('span');
    span.textContent = taskInputValue;
    const button = document.createElement('button');
    button.textContent = 'Excluir'
    button.addEventListener('click', function(){
        li.remove();
    })

    li.appendChild(span)
    li.appendChild(button)

    taskList.appendChild(li);
})
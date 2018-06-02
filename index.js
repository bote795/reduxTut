function generateId() {
      return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

// App Code
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const TOGGLE_TODO = 'TOGGLE_TODO'
const ADD_GOAL = 'ADD_GOAL'
const REMOVE_GOAL = 'REMOVE_GOAL'
const RECEIVE_DATA = 'RECEIVE_DATA'
function addTodoAction(todo) {
    return {
        type: ADD_TODO,
        todo,
    }
}
function removeTodoAction(id) {
    return {
        type: REMOVE_TODO,
        id,
    }
}
function toggleTodoAction(id) {
    return {
        type: TOGGLE_TODO,
        id,
    }
}
function addGoalAction(goal) {
    return {
        type: ADD_GOAL,
        goal,
    }
}
function removeGoalAction(id) {
    return {
        type: REMOVE_GOAL,
        id,
    }
}
function receiveDataAction(todos, goals) {
    return {
        type: RECEIVE_DATA,
        todos, 
        goals
    }
    
}
function handleAddGoal(name, cb){
    return (dispatch) => {
        return API.saveGoal(name)
        .then((newGoal)=> {
           dispatch(addGoalAction(newGoal));
           cb();
        })
        .catch( () => alert('There was an error. Try again.'))
    }
}

function handleDeleteGoal(goal){
    return (dispatch) => {
        dispatch(removeGoalAction(goal.id)); 
        return API.deleteGoal(goal.id)
            .catch(() => {
                dispatch(addGoalAction(goal)); 
                alert('An error occured. Try again.')
            })
    }
}
function handleAddTodo(name, cb){
    return (dispatch) => {
        return API.saveTodo(name)
        .then((newTodo)=> {
            cb();
           dispatch(addTodoAction(newTodo));
        })
        .catch( () => alert('There was an error. Try again.'))
   
    }
}
function handleToggleTodo(todo){
    return (dispatch) =>{
        dispatch(toggleTodoAction(todo.id));
        return API.saveTodoToggle(todo.id)
            .catch(() => {
                dispatch(toggleTodoAction(todo.id)); 
                alert('An error occured. Try again.')
            })
    }
}
function handleDeleteTodo(todo){
    return (dispatch) => {
        dispatch(removeTodoAction(todo.id)); 
        return API.deleteTodo(todo.id)
            .catch(() => {
                dispatch(addTodoAction(todo)); 
                alert('An error occured. Try again.')
            })
    }
    
}
function handleInitialData(){
    return (dispatch) =>{
        return Promise.all([
            API.fetchTodos(),
            API.fetchGoals()
        ]).then(([todos, goals]) => {
            dispatch(receiveDataAction(
                todos,
                goals
            ))
        })
    }
}
const checker = (store) => (next) => (action) => {
    if (
        action.type === ADD_TODO &&
        action.todo.name.toLowerCase().indexOf('bitcoin') !== -1
    ) {
        return alert("Nope. That is a bad idea");
    }
    if (
        action.type === ADD_GOAL &&
        action.goal.name.toLowerCase().indexOf('bitcoin') !== -1
    ) {
        return alert("Nope. That is a bad idea");
    }
    return next(action); 
}

const logger = (store) => (next) => action => {
    console.group(action.type);
    console.log('The action: ', action);
    const result = next(action);
    console.log('The new state: ', store.getState());
    console.groupEnd();
    return result;
}


// Reducer function
function todos(state = [], action) {
    switch (action.type) {
        case ADD_TODO:
            return state.concat([action.todo])
        case REMOVE_TODO:
            return state.filter((todo) => todo.id !== action.id)
        case TOGGLE_TODO:
            return state.map((todo) => todo.id !== action.id ? todo :
                Object.assign({}, todo, { complete: !todo.complete })
            )
        case RECEIVE_DATA:
            return action.todos
        default:
            return state
    }
}
function goals(state = [], action) {
    switch (action.type) {
        case ADD_GOAL:
            return state.concat([action.goal])
        case REMOVE_GOAL:
            return state.filter((goal) => goal.id !== action.id)
        case RECEIVE_DATA:
            return action.goals
        default:
            return state
    }
}

function loading( state = true, action){
    switch(action.type){
        case RECEIVE_DATA: 
            return false
        default : 
            return state
    }

}

const store = Redux.createStore(Redux.combineReducers({
    todos,
    goals,
    loading
}), Redux.applyMiddleware(ReduxThunk.default, checker, logger))

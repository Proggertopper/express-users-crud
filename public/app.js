async function loadUsers(){
    const response = await fetch("/api/users");

    const users = await response.json();

    const usersList = document.getElementById("usersList");

    usersList.innerHTML = '';

    for(const user of users){
        const listItem = document.createElement('li');

        listItem.textContent=`${user.name} , ${user.age} years`;

        const editButton = document.createElement('button');
        editButton.textContent='Edit';

        editButton.addEventListener('click', () => {
            editUser(user);
        })


        const deleteButton = document.createElement('button');
        deleteButton.textContent='Delete';

        deleteButton.addEventListener("click" , () => {
            deleteUser(user.id);
        });

        listItem.append(editButton);
        listItem.append(deleteButton);

        usersList.append(listItem);
    }
}

async function deleteUser(id){

    try {
        const response = await fetch(`/api/users/${id}` , {
        method: 'DELETE'
    });

    if(!response.ok){
        throw new Error('Could not delete user');
    }

    loadUsers();
    } catch(error){
        console.error(error);
    }
    
}

async function editUser(user){
    const name = prompt("New name: " , user.name);

    if (name === null){
        return;
    }

    const age = prompt("New age: ", user.age);

    if(age === null){
        return;
    }

    try{
        const response = await fetch(`/api/users/${user.id}` , {
            method: "PUT" , 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                age: age
            })
        });

        if(!response.ok){
            throw new Error('Could not update user');
        }

        loadUsers();
    } catch(error){
        console.error(error);
        alert('Could not update user');
    }
}

const loadButton = document.getElementById('loadButton');

loadButton.addEventListener("click" , loadUsers);

const userForm = document.getElementById("userForm");

userForm.addEventListener("submit" , async (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("nameInput");
    const ageInput = document.getElementById("ageInput");

    const newUser = {
        name: nameInput.value , 
        age: ageInput.value
    };

    try {
        const response = await fetch('/api/users', {
        method: 'POST' , 
        headers: {
            'Content-Type': 'application/json'
        } ,
        body: JSON.stringify(newUser)
    });

    if(!response.ok){
        throw new Error('Server error: ' + response.status);
    }

    userForm.reset();

    loadUsers();
    } catch(error){
        console.error(error);
        alert('Could not add user. Check whether the server is running.');
    }
});
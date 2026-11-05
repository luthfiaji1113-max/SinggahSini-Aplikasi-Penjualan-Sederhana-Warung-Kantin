document.getElementById('registrationForm').addEventListener('submit', function (event) {
    event.preventDefault();
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let valid = true;

    if (name === '') {
        document.getElementById('nameError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('nameError').style.display = 'none'; // Diperbaiki dari 'name' menjadi 'none'
    }

    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('emailError').style.display = 'none';
    }

    if (password.length < 6) {
        document.getElementById('passwordError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('passwordError').style.display = 'none';
    }

    if (valid) {
        alert('Pendaftaran berhasil!');
        document.getElementById('registrationForm').reset();
    }
});

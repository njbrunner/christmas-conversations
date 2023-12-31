let familyList = [];

window.addEventListener("load", () => {
  getFamily();
  const darkTheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (darkTheme.matches) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-bs-theme", "light");
  }
});

function setTheme(theme) {
  const themeIcon = document.getElementById("theme-icon");
  const lightThemeButton = document.getElementById("light-theme-button");
  const darkThemeButton = document.getElementById("dark-theme-button");
  if (theme == "light") {
    document.documentElement.setAttribute("data-bs-theme", "light");
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
    darkThemeButton.classList.remove("active");
    lightThemeButton.classList.add("active");
  } else {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
    lightThemeButton.classList.remove("active");
    darkThemeButton.classList.add("active");
  }
}

function getFamily() {
  axios({
    method: "GET",
    url: "https://getfamily-4fuif4r4iq-uc.a.run.app",
  }).then((response) => {
    familyList = response.data;
    populateDropdown();
    if (isFinished()) {
      showComplete();
    }
  });
}

function populateDropdown() {
  const familyListDropdown = document.getElementById("familyList");
  familyListDropdown.innerHTML = "";
  for (member of familyList) {
    const newMember = document.createElement("li");
    if (member["complete"]) {
      newMember.innerHTML = `
      <a class="dropdown-item disabled" href="#">${member["name"]}</a>
    `;
    } else {
      newMember.innerHTML = `
      <a class="dropdown-item" href="#" onclick="setSelectedFamilyMember('${member["name"]}'); return false;">${member["name"]}</a>
    `;
    }
    familyListDropdown.appendChild(newMember);
  }
  clearSelectedFamilyMember();
}

function setSelectedFamilyMember(name) {
  const familyMemberObject = familyList.find(
    (member) => member["name"] === name
  );
  const questionSection = document.getElementById("questionSection");
  questionSection.innerHTML = `
    <h3 class="text-center christmas-name">${familyMemberObject["name"]}</h3>
    <h6>What's ${familyMemberObject["name"]}'s passion?</h6>
    <div class="input-group">
      <input id="answer-input" type="text" class="form-control" placeholder="Answer">
    </div>
    <div class=text-center style="margin:2rem;">
    <button type="button" class="btn btn-outline-secondary christmas-button">Submit</button>
    </div>
  `;
  const submitButton = questionSection.getElementsByTagName("button")[0];
  submitButton.addEventListener("click", () => {
    submitAnswer(familyMemberObject);
  });
}

function clearSelectedFamilyMember() {
  const questionSection = document.getElementById("questionSection");
  questionSection.innerHTML = "";
}

function submitAnswer(familyMemberObject) {
  const answer = document.getElementById("answer-input").value;

  if (
    answer.trim().toLowerCase() == familyMemberObject["answer"].toLowerCase()
  ) {
    createToast("Correct!");
    axios({
      method: "PUT",
      url: `https://completefamilybyid-4fuif4r4iq-uc.a.run.app/${familyMemberObject["id"]}`,
    })
      .then((response) => {
        getFamily();
      })
      .catch((error) => {
        console.log(error.response.data.error);
        createErrorToast(error.response.data.error);
      });
  } else {
    createErrorToast("That's not right, try again.");
  }
}

function createToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      "border-radius": "15px",
      background: "linear-gradient(to right, #0F8A5F, #34A65F)",
    },
  }).showToast();
}

function createErrorToast(message) {
  Toastify({
    text: message,
    duration: 5000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      "border-radius": "15px",
      background: "linear-gradient(to right, #CC231E, #F5624D)",
    },
  }).showToast();
}

function isFinished() {
  for (member of familyList) {
    if (!member["complete"]) {
      return false;
    }
  }
  return true;
}

function showComplete() {
  const questionSection = document.getElementById("questionSection");
  questionSection.innerHTML = `
    <h3><span class="christmas-color">Congratulations!</span> You've completed Christmas Conversations!</h3>
    <br>
    <h6>Enter your email below to receive your reward:</h6>
    <div class="form-group">
        <input placeholder="Email" type="email" class="form-control" id="email">
    </div>
    <div class=text-center style="margin:2rem;">
      <button class="btn btn-outline-secondary christmas-button" onclick="sendEmail()">Submit</button>
    </div>
  `;
}

function sendEmail() {
  const email = document.getElementById("email").value;
  axios({
    method: "POST",
    url: `https://test-4fuif4r4iq-uc.a.run.app`,
    data: { email: email },
  })
    .then((response) => {
      console.log(response);
      createToast("Email sent!");
    })
    .catch((error) => {
      console.log(error);
      console.log(error.response.data.error);
      createErrorToast(error.response.data.error);
    });
}

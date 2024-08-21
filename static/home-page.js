let bulkStudentIds = { add: {}, remove: {} };

window.addEventListener("load", () => {
  bulkStudentIds.add.points = new mdc.textField.MDCTextField(
    document.getElementById("bulk-student-ids-add-points")
  );
  bulkStudentIds.remove.points = new mdc.textField.MDCTextField(
    document.getElementById("bulk-student-ids-remove-points")
  );

  const searchText = document.getElementById("search-text-field");

  mdc.textField.MDCTextField.attachTo(document.getElementById("search-bar"));

  searchText.addEventListener("input", (event) => {
    // Remove newlines
    // TODO: Prevent carriage returns as well
    event.target.value = event.target.value.replace(/\n/g, "");
  });

  // Lets go ahead and setup a proper debounce on the search bar
  let searchTimer;
  const searchDebounceTime = 1500; // time in ms, 3 seconds here

  const searchFunc = async (opts = {}) => {
    if (searchText.value.length === 0) {
      return;
    }

    if (opts.now) {
      // This indicates enter was hit.
      // If enter was hit, and the search string seems to be a valid student ID,
      // we will not preform a search, and instead will redirect immediatly to
      // the student page.
      // TODO: It's worth noting that this expects a student ID to be at least
      // 5 digits for allowing a search to occur
      const studentIdReg = new RegExp(/^[0-9]{5,}$/);

      if (studentIdReg.test(searchText.value)) {
        redirectToStudent(searchText.value);
      }
    }

    const response = await fetch(`/api/student?q=${searchText.value}`);
    const results = await response.json();

    const resultsPane = document.getElementById("search-results");

    let htmlResults = generateHTMLSearchResults(results);

    resultsPane.innerHTML = htmlResults;

    new mdc.list.MDCList(document.querySelector(".mdc-list"));
  };

  searchText.addEventListener("keyup", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(searchFunc, searchDebounceTime);
  });

  searchText.addEventListener("keydown", (event) => {
    clearTimeout(searchTimer);
    if (event.keyCode === 13) {
      // User has pressed enter
      searchFunc({ now: true });
    }
  });
});

function generateHTMLSearchResults(res) {
  let generated = "";

  generated += "<ul class='mdc-list'>";

  for (let i = 0; i < res.length; i++) {
    let tabindex = i === 0 ? "tabindex='0'" : "";

    generated += `
<li class="mdc-list-item" ${tabindex} onclick="redirectToStudent(${res[i].student_id})" onkeydown="keyRedirectToStudent(event, ${res[i].student_id})">
  <span class="mdc-list-item__ripple"></span>
  <span class="mdc-list-item">
    <span class="mdc-list-item__text search-list">
      <span class="mdc-list-item__text mdc-typography--headline6">${res[i].first_name} ${res[i].last_name}</span>
      <span class="mdc-typography--subtitle1">Student ID: ${res[i].student_id}</span>
      <span class="mdc-list-item__text mdc-typography--subtitle1">Points: ${res[i].points}</span>
    </span>
  </span>
</li>
`;

    if (i !== res.length - 1) {
      generated += "<li role='separator' class='mdc-list-divider'></li>";
    }
  }

  generated += "</ul>";

  return generated;
}

function redirectToStudent(id) {
  window.location.href = `/student/${id}`;
}

function keyRedirectToStudent(event, id) {
  event = event || window.event;
  if (event.keyCode === 13) {
    // User pressed enter
    redirectToStudent(id);
  }
}

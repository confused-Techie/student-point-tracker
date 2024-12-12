const points = { add: {}, remove: {} };

window.addEventListener("load", () => {
  points.add.dialog = new mdc.dialog.MDCDialog(
    document.getElementById("add-points-dialog")
  );
  points.remove.dialog = new mdc.dialog.MDCDialog(
    document.getElementById("remove-points-dialog")
  );

  points.add.reason = new mdc.textField.MDCTextField(
    document.getElementById("add-points-reason")
  );
  points.remove.reason = new mdc.textField.MDCTextField(
    document.getElementById("remove-points-reason")
  );

  points.add.menu = new mdc.menu.MDCMenu(
    document.getElementById("add-points-menu")
  );
  points.remove.menu = new mdc.menu.MDCMenu(
    document.getElementById("remove-points-menu")
  );

  points.add.chipset = new mdc.chips.MDCChipSet(
    document.getElementById("add-points-chip-set")
  );
  points.remove.chipset = new mdc.chips.MDCChipSet(
    document.getElementById("remove-points-chip-set")
  );

  points.add.count = new mdc.textField.MDCTextField(
    document.getElementById("add-points-count")
  );
  points.remove.count = new mdc.textField.MDCTextField(
    document.getElementById("remove-points-count")
  );

  points.add.dialog.listen("MDCDialog:opened", () => {
    points.add.reason.layout();
    points.add.menu.layout();
    points.add.count.layout();
  });

  points.remove.dialog.listen("MDCDialog:opened", () => {
    points.remove.reason.layout();
    points.remove.menu.layout();
    points.remove.count.layout();
  });

  points.add.dialog.listen("MDCDialog:closed", async (action) => {
    if (action.detail.action === "accept") {
      // The user has accepted the prompt
      let points = document.getElementById("add-points-count-text-field").value;
      let reason = document.getElementById(
        "add-points-reason-text-field"
      ).value;

      await addPoints(points, reason);
    }
  });

  points.remove.dialog.listen("MDCDialog:closed", async (action) => {
    if (action.detail.action === "accept") {
      // The user has accepted the prompt
      let points = document.getElementById(
        "remove-points-count-text-field"
      ).value;
      let reason = document.getElementById(
        "remove-points-reason-text-field"
      ).value;

      await removePoints(points, reason);
    }
  });

  points.add.menu.listen("MDCMenu:selected", (data) => {
    points.add.reason.value = data.detail.item.dataset.reason;
    points.add.count.value = data.detail.item.dataset.amount;
  });

  points.remove.menu.listen("MDCMenu:selected", (data) => {
    points.remove.reason.value = data.detail.item.dataset.reason;
    points.remove.count.value = data.detail.item.dataset.amount;
  });
});

async function addPoints(points, reason) {
  const makeAddPointsRequest = async (idReq, pointsReq, reasonReq, notify) => {
    const response = await fetch(
      `/api/student/${idReq}/points?points=${pointsReq}&reason=${reasonReq}`,
      { method: "POST" }
    );

    if (response.status !== 201) {
      console.error(response);
      // TODO: Add snackbar
      return { ok: false, content: response };
    }

    if (notify) {
      generateSuccessSnackbar(
        `Successfully added '${pointsReq}' Points to Student ${idReq}.`
      );
    }
    return { ok: true, content: null };
  };

  if (document.getElementById("bulk-student-ids-add-text-field")) {
    let student_ids = getBulkIds(
      document.getElementById("bulk-student-ids-add-text-field").value
    );

    let didFail = false;
    for (let i = 0; i < student_ids.length; i++) {
      let req = await makeAddPointsRequest(
        student_ids[i],
        points,
        reason,
        false
      );

      if (!req.ok) {
        console.error(req.content);
        didFail = true;
      }
    }

    if (!didFail) {
      generateSuccessSnackbar(
        `Successfully added '${points}' Points to ${student_ids.length} Students`
      );
    }
  } else {
    // This is coming from the student page, of which we have a `student_id` const to rely on
    await makeAddPointsRequest(student_id, points, reason, true);
  }
}

async function removePoints(points, reason) {
  const makeRemovePointsRequest = async (
    idReq,
    pointsReq,
    reasonReq,
    notify
  ) => {
    const response = await fetch(
      `/api/student/${idReq}/points?points=${pointsReq}&reason=${reasonReq}`,
      { method: "DELETE" }
    );

    if (response.status !== 204) {
      console.error(response);
      // TODO: Make this a snackbar
      return { ok: false, content: response };
    }

    if (notify) {
      generateSuccessSnackbar(
        `Successfully removed '${points}' Points from Student ${student_id}.`
      );
    }
    return { ok: true, content: null };
  };

  if (document.getElementById("bulk-student-ids-remove-text-field")) {
    let student_ids = getBulkIds(
      document.getElementById("bulk-student-ids-remove-text-field").value
    );

    let didFail = false;
    for (let i = 0; i < student_ids.length; i++) {
      let req = await makeRemovePointsRequest(
        student_ids[i],
        points,
        reason,
        false
      );

      if (!req.ok) {
        console.error(req.content);
        didFail = true;
      }
    }

    if (!didFail) {
      generateSuccessSnackbar(
        `Successfully removed '${points}' Points to ${student_ids.length} Students`
      );
    }
  } else {
    // This is coming from the student page, of which we have a `student_id` const to rely on
    await makeRemovePointsRequest(student_id, points, reason, true);
  }
}

function getBulkIds(idList) {
  // Takes a list of student IDs from the bulk textarea, and returns a proper array of individual IDs
  let idListArray = idList.split("\n");

  let idArray = [];

  for (let i = 0; i < idListArray.length; i++) {
    const idVal = idListArray[i].trim().replace(/[^0-9]+/g, "");
    idArray.push(idVal);
    // if (!idArray.includes(idVal)) {
    //   idArray.push(idVal);
    // }
  }

  return idArray;
}

function chipPointChange(action, count) {
  if (action === "add") {
    points.add.count.value = count;
  } else if (action === "remove") {
    points.remove.count.value = count;
  }
}

function generateSuccessSnackbar(msg) {
  document.getElementById("snackbar-container").innerHTML = `
  <aside class="mdc-snackbar">
    <div class="mdc-snackbar__surface" role="status" aria-relevant="additions">
      <div class="mdc-snackbar__label" aria-atomic="false">
        ${msg}
      </div>
      <div class="mdc-snackbar__actions" aria-atomic="true">
        <button type="button" class="mdc-icon-button mdc-snackbar__action mdc-snackbar__dismiss material-icons" title="Dismiss">
          close
        </button>
      </div>
    </div>
  </aside>
  `;

  const snackbar = new mdc.snackbar.MDCSnackbar(
    document.querySelector(".mdc-snackbar")
  );

  snackbar.open();
}

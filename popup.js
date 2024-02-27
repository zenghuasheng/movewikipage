// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to fetch data button
  document.getElementById('fetchDataButton').addEventListener('click', fetchDataAndRenderTree);

  // Add event listener to the move button
  document.getElementById('moveButton').addEventListener('click', moveSelectedPages);

  // Add event listener to checkbox
  $(document).on('change', '.pageCheckbox', function() {
    const $selectedPagesTextarea = $('#selectedPages');
    const $selectedPageUUIDsInput = $('#selectedPageUUIDs');
    const pageUUID = $(this).parent().data('uuid');
    const pageTitle = $(this).parent().text().trim();

    // Update textarea with selected page titles
    const currentText = $selectedPagesTextarea.val();
    $selectedPagesTextarea.val(currentText + pageTitle + '\n');

    // Update hidden input with selected page UUIDs
    const currentUUIDs = $selectedPageUUIDsInput.val().split(',');
    currentUUIDs.push(pageUUID);
    $selectedPageUUIDsInput.val(currentUUIDs.join(','));
  });
});

function fetchDataAndRenderTree() {
  const spaceUUID = $('#spaceUUID').val();
  if (spaceUUID) {
    const apiUrl = `https://our.ones.pro/wiki/api/wiki/team/RDjYMhKq/space/${spaceUUID}/pages`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          // Filter pages based on parent_uuid
          const filteredPages = filterPagesByParentUUID(data.pages, "WRExTVFQ");
          renderTree(filteredPages);
        });
  } else {
    console.error('Space UUID is required');
  }
}

function filterPagesByParentUUID(pages, parentUUID) {
  return pages.filter(page => page.parent_uuid === parentUUID);
}

function renderTree(pages) {
  const $tree = $('#tree');
  $tree.empty();
  renderTreeRecursive(pages, $tree);
}

function renderTreeRecursive(pages, $parent) {
  const $ul = $('<ul>');
  pages.forEach(page => {
    const $li = $(`<li data-uuid="${page.uuid}">${page.title} <input type="checkbox" class="pageCheckbox"></li>`);
    $li.appendTo($ul);

    if (page.pages && page.pages.length > 0) {
      renderTreeRecursive(page.pages, $li);
    }
  });
  $ul.appendTo($parent);
}

function moveSelectedPages() {
  const spaceUUID = $('#spaceUUID').val();
  let selectedPageUUIDs = $('#selectedPageUUIDs').val().split(',');
  const targetParentPageUUID = $('#targetParentPage').val();

  // Filter out empty values from selectedPageUUIDs
  selectedPageUUIDs = selectedPageUUIDs.filter(uuid => uuid.trim() !== '');

  if (spaceUUID && selectedPageUUIDs.length > 0 && targetParentPageUUID) {
    const successMessages = [];

    selectedPageUUIDs.forEach(selectedPageUUID => {
      const apiUrl = `https://our.ones.pro/wiki/api/wiki/team/RDjYMhKq/space/${spaceUUID}/page/${selectedPageUUID}/update`;
      const requestBody = {
        space_uuid: spaceUUID,
        parent_uuid: targetParentPageUUID,
        version: 0
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              return response.text().then(errorText => Promise.reject(errorText));
            }
          })
          .then(data => {
            successMessages.push(`Page ${selectedPageUUID} moved successfully`);
            console.log(successMessages);
          })
          .catch(error => {
            console.error(`Error moving page ${selectedPageUUID}`, error);
            showNotification('Error Moving Pages', `Error moving page ${selectedPageUUID}: ${error}`);
          });
    });

    if (successMessages.length > 0) {
      const notificationMessage = successMessages.join('\n');
      showNotification('Pages Moved Successfully', notificationMessage);
    }
  } else {
    console.error('Space UUID, Selected Page UUIDs, and Target Parent Page UUID are required');
  }
}


function showNotification(title, message) {
  // popup.js
  if (chrome.notifications) {
    console.log('Notifications are supported.');
  } else {
    console.error('Notifications are not supported.');
    return;
  }
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: title,
    message: message
  });
}


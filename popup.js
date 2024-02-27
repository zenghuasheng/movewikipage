// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to fetch data button
  document.getElementById('fetchDataButton').addEventListener('click', fetchDataAndRenderTree);

  // Add event listener to the move button
  document.getElementById('moveButton').addEventListener('click', moveSelectedPage);

  // Add event listener to checkbox
  $(document).on('change', '.pageCheckbox', function() {
    const selectedPageUUID = $(this).parent().data('uuid');
    $('#selectedPage').val(selectedPageUUID);
  });

});

function fetchDataAndRenderTree() {
  const spaceUUID = $('#spaceUUID').val();
  if (spaceUUID) {
    const apiUrl = `https://our.ones.pro/wiki/api/wiki/team/RDjYMhKq/space/${spaceUUID}/pages`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
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
  // Render the tree using jQuery or other preferred method
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


function moveSelectedPage() {
  const spaceUUID = $('#spaceUUID').val();
  const selectedPageUUID = $('#selectedPage').val();
  const targetParentPageUUID = $('#targetParentPage').val();

  if (spaceUUID && selectedPageUUID && targetParentPageUUID) {
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
    .then(response => response.json())
    .then(data => console.log('Page moved successfully', data))
    .catch(error => console.error('Error moving page', error));
  } else {
    console.error('Space UUID, Selected Page UUID, and Target Parent Page UUID are required');
  }
}


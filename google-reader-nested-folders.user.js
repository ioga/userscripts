// ==UserScript==
// @name           Google Reader: Nested Folders
// @namespace      ioga
// @version        0.1
// @author         sethaurus
// @author         ioga
// @description    Displays folders (tags) in a nested hierarchy, when (for example) one folder is named category, and another is named category:subcategory. Note that the names must be separated by a colon, and that the outer folder must exist, even if it does not directly contain any feeds. Folders an be nested to an arbitrary depth.
// @include        http://*.google.com/reader*
// @include        https://*.google.com/reader*
// ==/UserScript==
// Based on publicly available userscripts at
//   - http://userscripts.org/scripts/show/64659
//   - http://userscripts.org/topics/118022
//
// Added the display of the total unread items count for all subfolders to the
// parent folder.

(function () {
  setTimeout(arguments.callee, 100);
  if (domIsDirty()) nestFolders();
})();
function parseNode(html) {
  if (! parseNode.element) {
    parseNode.element = document.createElement('div');
  }
  parseNode.element.innerHTML = html;
  return parseNode.element.firstChild;
};

function getUnreadCount(folderNode) {
  return parseInt(folderNode.querySelector('.unread-count').innerHTML.replace(/\(|\)/g, '')) || 0;
};

function setUnreadCount(folderNode, count) {
    folderNode.querySelector('.unread-count').innerHTML = ["(", ")"].join(count);
};

function nestFolders() {
  var folderNodes = document.querySelectorAll('.folder, .tag'), folderMap = {};

  var i = 0, folder;
  while (folder = folderNodes[i++]) {
    var nameNode = folder.querySelector('.name');
    if (nameNode) folderMap[nameNode.innerHTML.split(' (')[0]] = folder;
  }
  for (var name in folderMap) {
    var folder = folderMap[name],
      nameTokens = name.split(':').reverse(),
      prefix = nameTokens.slice(1).reverse().join(':'),
            parentFolder = folderMap[prefix];

    if (name != prefix && (prefix in folderMap)) {
      var parent = parentFolder.querySelector('ul');

      if (! parent) {
        parent = parentFolder.appendChild(document.createElement('ul'));
      };

      var wrapper = parseNode('<div style="position:relative; left:21px;" />');
      wrapper.appendChild(folder);
      wrapper.querySelector('.name-text').innerHTML = nameTokens[0];
      wrapper.querySelector('.link').style.cssText = 'margin-left: -21px';

      parent.insertBefore(wrapper, parent.firstChild);

            setUnreadCount(parentFolder, getUnreadCount(parentFolder) + getUnreadCount(folder));
    }
  }
};
function domIsDirty() {
  var isDirty = ! document.querySelector('#clean-flag');

  if (isDirty) {
    document.querySelector('#sub-tree')
      .appendChild(parseNode('<div id="clean-flag" />'));
  }

  return isDirty;
};

export function shouldCapitaliseForI(text) {
    var regex = /\s+i(\s+|')$/;
    var matches = regex.test(text);

    return matches;
}

export function shouldCapitalise(text) {
    var multilineRegex = /\s*\n+\s*\w$/;
    var matches = multilineRegex.test(text);

    if (matches) return true;

    var sentenceRegex = /\w+\s*(\.|\?)+\s+\w$/;
    matches = sentenceRegex.test(text);

    if (!matches) {
        return text.length == 1;
    }

    return matches;
}

export function onError(error) {
    console.log(error);
}


export function getText(htmlControl, tagName) {
    if (
        tagName.toUpperCase() === 'INPUT' ||
      tagName.toUpperCase() === 'TEXTAREA'
    ) {
        return htmlControl.val();
    }

    return htmlControl.html();
}

export function setText(htmlControl, tagName, updatedStr, shouldAppendBr) {
    if (
        tagName.toUpperCase() === 'INPUT' ||
      tagName.toUpperCase() === 'TEXTAREA'
    ) {
        htmlControl.val(updatedStr);
        return;
    }

    if (shouldAppendBr) {
        updatedStr += '<br>';
    }

    htmlControl.html(updatedStr);
    setEndOfContenteditable(htmlControl[0]);
}

export function setEndOfContenteditable(contentEditableElement) {
    var range, selection;
    if (document.createRange) {
        //Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange(); //Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection(); //get the selection object (allows you to change selection)
        selection.removeAllRanges(); //remove any selections already made
        selection.addRange(range); //make the range you have just created the visible selection
    } else if (document.selection) {
        //IE 8 and lower
        range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
        range.select(); //Select the range (make it the visible selection
    }
}


export function capitaliseText(element) {
    if(!element)
        return;

    var htmlControl = $(element);
    var tagName = htmlControl.prop('tagName');

    if (!element.isContentEditable && tagName.toUpperCase() !== 'TEXTAREA') {
        return;
    }

    var text = getText(htmlControl, tagName);

    //support for jira's comment section's p tags
    var lastChar = text.trim().slice(-1);
    if (lastChar.match(/[a-z]/i) && lastChar.toUpperCase() === lastChar) {
        return;
    }

    var shouldAppendBr = false;
    if (text.length >= 4 && text.slice(-4) === '<br>') {
        text = text.slice(0, -4);
        shouldAppendBr = true;
    }

    if (utils.shouldCapitalise(text)) {
        var updatedStr = getCapitalisedContent(text);

        setText(htmlControl, tagName, updatedStr, shouldAppendBr);
        return;
    }

    if (text.length >= 2 && utils.shouldCapitaliseForI(text)) {
        var updatedStr = getCapitalisedContentForI(text);

        setText(htmlControl, tagName, updatedStr, shouldAppendBr);
        return;
    }
}

export function getCapitalisedContentForI(text) {
    var lastTwoChars = text.slice(-2);
    var updatedStr =
      text.substr(0, text.length - 2) + lastTwoChars.toUpperCase();
    return updatedStr;
}

export function getCapitalisedContent(text) {
    var lastChar = text.slice(-1);
    var updatedStr = text.substr(0, text.length - 1) + lastChar.toUpperCase();
    return updatedStr;
}

export function containsHtmlContent(element) {
    var content = $(element).html();

    var brRegex = /\s*<br>/;
    if (content && brRegex.test(content)) return false;

    var regex = /<\/?\w+>/;
    var hasHtmlTag = regex.test(content);
    return hasHtmlTag;
}

export function isContentEditable(element) {
    return element && element.isContentEditable;
}

export function getFilteredElements(addedNodes, tagName) {
    return $(addedNodes)
        .find(tagName)
        .addBack(tagName); // finds either added alone or as tree
}

export function shouldCapitaliseContent(element) {
    return isContentEditable(element) && !containsHtmlContent(element);
}

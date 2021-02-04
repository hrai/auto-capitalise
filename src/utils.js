export let should_capitalise_i = false;
export let should_capitalise_names = false;
export let should_capitalise_abbreviations = false;
export let constants_key_val = {};
export let names_key_val = {};
export let abbreviations_key_val = {};
let words_to_exclude = [];

export function shouldCapitaliseForI(text) {
  const regex = /\s+i(\s+|')$/;
  const matches = regex.test(text);

  return matches;
}

export function setShouldCapitaliseI(value) {
  if (value != null) {
    should_capitalise_i = value;
  }
}

export function setShouldCapitaliseNames(value) {
  if (value != null) {
    should_capitalise_names = value;
  }
}

export function setShouldCapitaliseAbbreviations(value) {
  if (value != null) {
    should_capitalise_abbreviations = value;
  }
}

export function setConstantsKeyVal(value) {
  if (value != null) {
    constants_key_val = value;
  }
}

export function setNamesKeyVal(value) {
  if (value != null) {
    names_key_val = value;
  }
}

export function setAbbreviationsKeyVal(value) {
  if (value != null) {
    abbreviations_key_val = value;
  }
}

export function shouldCapitalise(text) {
  const multilineRegex = /\s*\n+\s*\w$/;
  let matches = multilineRegex.test(text);

  if (matches) {
    return true;
  }

  const sentenceRegex = /\w+\s*([.?!])+\s+\w$/;
  matches = sentenceRegex.test(text);

  if (!matches) {
    // console.log(text);
    // console.log(text.length);
    return text.length == 1;
  }

  return matches;
}

export function getCaseInsensitiveMatchingAndCorrectedWords(
  text,
  keyValuePairs
) {
  return getMatchingAndCorrectedWords(
    text,
    keyValuePairs,
    words_to_exclude,
    true
  );
}

export function getCaseSensitiveMatchingAndCorrectedWords(text, keyValuePairs) {
  return getMatchingAndCorrectedWords(
    text,
    keyValuePairs,
    words_to_exclude,
    false
  );
}

export function getMatchingAndCorrectedWords(
  text,
  keyValuePairs,
  words_to_exclude,
  case_insensitive
) {
  const lastWordRegex = /\b(\w+)\W$/;

  let match = lastWordRegex.exec(text);
  const noMatch = ['', ''];

  if (match) {
    const matchedWord = match[1];

    if (matchedWord != null) {
      if (words_to_exclude.includes(matchedWord.toLowerCase())) {
        return noMatch;
      }

      let correctedWord = getCorrectedWord(
        case_insensitive,
        matchedWord,
        keyValuePairs
      );

      if (correctedWord != null) {
        return [matchedWord, correctedWord];
      }
    }
  }

  return noMatch;
}

function getCorrectedWord(case_insensitive, matchedWord, keyValuePairs) {
  return case_insensitive === true
    ? keyValuePairs[matchedWord.toLowerCase()]
    : keyValuePairs[matchedWord];
}

export function onError(error) {
  console.log(error);
}

export function getText(htmlControl, tagName) {
  if (
    tagName.toUpperCase() === 'INPUT' ||
    tagName.toUpperCase() === 'TEXTAREA'
  ) {
    return htmlControl.value ? htmlControl.value : '';
  }

  return htmlControl.innerHTML ? htmlControl.innerHTML : '';
}

export function setText(htmlControl, tagName, updatedStr, shouldAppendBr) {
  if (
    tagName.toUpperCase() === 'INPUT' ||
    tagName.toUpperCase() === 'TEXTAREA'
  ) {
    htmlControl.value = updatedStr;
    return;
  }

  if (shouldAppendBr) {
    updatedStr += '<br>';
  }

  htmlControl.innerHTML = updatedStr;
  setEndOfContenteditable(htmlControl);
}

export function isFirstTextOfEditableTextNode(node) {
  const data = node.data;
  const textNode = '#text';

  if (
    node.nodeName === textNode &&
    data.length === 1 &&
    data.toUpperCase() != data &&
    shouldCapitaliseContent(node.parentNode)
  ) {
    return true;
  }

  return false;
}

export function setEndOfContenteditable(contentEditableElement) {
  let range, selection;
  if (document.createRange) {
    //Firefox, Chrome, Opera, Safari, IE 9+
    range = document.createRange(); //Create a range (a range is a like the selection but invisible)
    const childNodes = contentEditableElement.childNodes;

    if (childNodes == null) return;

    const childNode =
      childNodes.length == 1 ? childNodes[0] : childNodes[childNodes.length - 2];
    // childNodes.forEach(x=>console.log(x.outerHTML));

    if (childNode == null) {
      return;
    }

    if (childNode.nodeName === '#text') {
      range.setStart(childNode, childNode.data.length);
      range.collapse(false);
    } else if (childNode.outerHTML === '<br>') {
      range.setStart(childNode, 0);
      range.collapse(true);
    } else {
      range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
      range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
    }

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

export function capitaliseText(
  element,
  shouldCapitalise,
  shouldCapitaliseForI,
  getText,
  setText
) {
  if (!element) return;

  let tagName = element.tagName;

  if (!isEditableElement(element, tagName)) return;

  let text = getText(element, tagName);

  if (text == null) return;

  const lastChar = text.trim().slice(-1);
  const isLastCharAnAlphabet = lastChar.match(/[a-z]/i);

  if (text.length == 1 && !isLastCharAnAlphabet) {
    return;
  }

  //support for jira's comment section's p tags
  if (isLastCharAnAlphabet && lastChar.toUpperCase() === lastChar) {
    return;
  }

  let shouldAppendBr = false;
  if (text.length >= 4 && text.slice(-4) === '<br>') {
    text = text.slice(0, -4);
    shouldAppendBr = true;
  }

  if (shouldCapitalise(text)) {
    const updatedStr = getCapitalisedContent(text);

    setText(element, tagName, updatedStr, shouldAppendBr);
    return;
  }

  if (text.length >= 2 && shouldCapitaliseForI(text) && should_capitalise_i) {
    const updatedStr = getCapitalisedContentForI(text);

    setText(element, tagName, updatedStr, shouldAppendBr);
    return;
  }

  const caseSensitive = true;
  updateConstant(text, element, tagName, constants_key_val, caseSensitive);

  if (should_capitalise_names) {
    updateConstant(text, element, tagName, names_key_val, !caseSensitive);
  }

  if (should_capitalise_abbreviations) {
    updateConstant(
      text,
      element,
      tagName,
      abbreviations_key_val,
      !caseSensitive
    );
  }
}

function updateConstant(text, element, tagName, keyValuePairs, caseSensitive) {
  const [matchedWord, correctedWord] =
    caseSensitive === true
      ? getCaseSensitiveMatchingAndCorrectedWords(text, keyValuePairs)
      : getCaseInsensitiveMatchingAndCorrectedWords(text, keyValuePairs);

  if (matchedWord !== '') {
    if (matchedWord !== correctedWord) {
      let updatedStr = text.replace(matchedWord, correctedWord);
      setText(element, tagName, updatedStr, false);
    }
  }
}

export function getCapitalisedContentForI(text) {
  const lastTwoChars = text.slice(-2);
  const updatedStr =
    text.substr(0, text.length - 2) + lastTwoChars.toUpperCase();
  return updatedStr;
}

export function getCapitalisedContent(text) {
  const lastChar = text.slice(-1);
  const updatedStr = text.substr(0, text.length - 1) + lastChar.toUpperCase();
  return updatedStr;
}

export function containsHtmlContent(element) {
  const content = $(element).html();

  const brRegex = /\s*<br>/;
  if (content && brRegex.test(content)) return false;

  const regex = /<\/?\w+>/;
  const hasHtmlTag = regex.test(content);
  return hasHtmlTag;
}

export function isContentEditable(element) {
  return element && element.isContentEditable;
}

export function getFilteredElements(addedNodes, tagName) {
  return $(addedNodes).find(tagName).addBack(tagName); // finds either added alone or as tree
}

export function shouldCapitaliseContent(element) {
  return isContentEditable(element) && !containsHtmlContent(element);
}

export function isEditableElement(element, tagName) {
  return (
    element.isContentEditable ||
    tagName.toUpperCase() === 'INPUT' ||
    tagName.toUpperCase() === 'TEXTAREA'
  );
}

export function setWordsToExclude(value) {
  if (value) {
    words_to_exclude = value;
  }
}

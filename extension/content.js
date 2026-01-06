(() => {
  const SALE_PATTERN = /sale/i;
  if (!SALE_PATTERN.test(window.location.href)) return;

  const MEDIUM_PATTERNS = [/\bmedium\b/i, /^m$/i];
  const SIZE_FIELD_PATTERNS = [/size/i];
  const SORT_FIELD_PATTERNS = [/\bsort\b/i, /order\b/i];
  const LOW_TO_HIGH_PATTERNS = [
    /low\s*to\s*high/i,
    /price[^a-zA-Z]*asc/i,
    /ascending/i,
    /low[^a-zA-Z]*high/i,
    /lowest[^a-zA-Z]*first/i
  ];

  const MAX_OBSERVE_MS = 15000;
  const DEBOUNCE_MS = 250;
  let observer;
  let debounceId;

  const target = document.documentElement || document.body;
  if (!target) return;

  observer = new MutationObserver(() => {
    clearTimeout(debounceId);
    debounceId = setTimeout(applyPreferences, DEBOUNCE_MS);
  });

  observer.observe(target, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), MAX_OBSERVE_MS);

  applyPreferences();

  function applyPreferences() {
    const sized = applySizeFilter();
    const sorted = applyPriceSort();

    if (sized && sorted) observer.disconnect();
  }

  function applySizeFilter() {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const select of selects) {
      if (!fieldMatches(select, SIZE_FIELD_PATTERNS)) continue;
      if (selectMatchingOption(select, isMedium)) return true;
    }

    const inputs = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
    for (const input of inputs) {
      if (!fieldMatches(input, SIZE_FIELD_PATTERNS)) continue;
      if (inputMatchesMedium(input)) return true;
    }

    return false;
  }

  function applyPriceSort() {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const select of selects) {
      if (!fieldMatches(select, SORT_FIELD_PATTERNS)) continue;
      if (selectMatchingOption(select, isLowToHigh)) return true;
    }

    return false;
  }

  function selectMatchingOption(select, matcher) {
    const option = Array.from(select.options).find((opt) => matcher(getOptionText(opt)));
    if (!option) return false;

    if (select.value !== option.value) {
      option.selected = true;
      select.value = option.value;
      dispatchUpdates(select);
    }

    return true;
  }

  function inputMatchesMedium(input) {
    const labelText = getLabelText(input);
    const combined = `${getFieldClues(input)} ${labelText}`.trim();
    const mediumMatch = MEDIUM_PATTERNS.some((pattern) => pattern.test(combined));
    if (mediumMatch && !input.checked) {
      input.checked = true;
      dispatchUpdates(input);
    }
    return mediumMatch;
  }

  function isMedium(text) {
    return MEDIUM_PATTERNS.some((pattern) => pattern.test(text));
  }

  function isLowToHigh(text) {
    return LOW_TO_HIGH_PATTERNS.some((pattern) => pattern.test(text)) ||
      (/price/i.test(text) && /asc/i.test(text));
  }

  function fieldMatches(element, patterns) {
    const clues = getFieldClues(element);
    return patterns.some((pattern) => pattern.test(clues));
  }

  function getFieldClues(element) {
    const parts = [
      element.name,
      element.id,
      element.getAttribute('aria-label'),
      element.getAttribute('placeholder'),
      element.getAttribute('title'),
      getLabelText(element)
    ];

    const datasetValues = element.dataset ? Object.values(element.dataset) : [];
    parts.push(...datasetValues);

    const text = parts.filter(Boolean).join(' ').toLowerCase();
    return text;
  }

  function getLabelText(element) {
    let labelText = '';
    if (element.id) {
      const label = document.querySelector(`label[for="${escapeId(element.id)}"]`);
      if (label) labelText += ` ${label.textContent || ''}`;
    }
    const parentLabel = element.closest('label');
    if (parentLabel) labelText += ` ${parentLabel.textContent || ''}`;
    return labelText.trim().toLowerCase();
  }

  function getOptionText(option) {
    const text = `${option.textContent} ${option.value}`.trim();
    return text.toLowerCase();
  }

  function escapeId(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return value.replace(/([#.;?+*~\'":!^$\[\]()=>|\/])/g, '\\$1');
  }

  function dispatchUpdates(element) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
})();

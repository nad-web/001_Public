import {
  root,
  el,
  button,
  input,
  field,
  select,
  panel,
  row,
  form,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { UNIT_GROUPS, convert } from '../../../shared/js/logic.js';
let group = 'length',
  from = 'm',
  to = 'ft',
  value = '1',
  result = null;
function render() {
  const kind = select(
    'kind',
    [
      ['length', 'Length'],
      ['weight', 'Weight'],
      ['volume', 'Volume'],
      ['temperature', 'Temperature'],
    ],
    group,
  );
  kind.addEventListener('change', () => {
    group = kind.value;
    [from, to] = Object.keys(UNIT_GROUPS[group]);
    result = null;
    render();
  });
  const units = Object.entries(UNIT_GROUPS[group]).map(([id, [label]]) => [
    id,
    label,
  ]);
  const number = input('value', value, {
    type: 'number',
    step: 'any',
    required: true,
  });
  const source = select('from', units, from),
    target = select('to', units, to);
  const editor = form(
    [
      field('Measurement', kind),
      field('Value', number),
      row(field('From', source), field('To', target)),
    ],
    (data) => {
      value = data.get('value');
      from = data.get('from');
      to = data.get('to');
      if (!value.trim()) throw new Error('Enter a value.');
      result = convert(Number(value), group, from, to);
      render();
      report('Conversion calculated.');
    },
    'Convert',
  );
  root.replaceChildren(
    el(
      'div',
      { class: 'grid' },
      panel(
        'Make the units clear',
        editor,
        button('Swap units', () => {
          from = target.value;
          to = source.value;
          value = number.value;
          result = value.trim()
            ? convert(Number(value), group, from, to)
            : null;
          render();
        }),
      ),
      panel(
        'Your result',
        el(
          'div',
          { class: 'big-result', id: 'conversion-result' },
          result === null
            ? 'Ready when you are.'
            : new Intl.NumberFormat(undefined, {
                maximumSignificantDigits: 12,
              }).format(result),
        ),
        hint(
          result === null
            ? 'Choose units and enter a number.'
            : `${value} ${UNIT_GROUPS[group][from][0]} = ${new Intl.NumberFormat(undefined, { maximumSignificantDigits: 12 }).format(result)} ${UNIT_GROUPS[group][to][0]}`,
        ),
        hint(
          group === 'temperature'
            ? 'Conversions use Celsius as the intermediate scale. Values below absolute zero are rejected.'
            : 'Calculation: value × source factor ÷ destination factor.',
        ),
        hint(
          'Displayed values are rounded to 12 significant digits. Volume units explicitly use US gallons and US cups.',
        ),
      ),
    ),
  );
}
render();

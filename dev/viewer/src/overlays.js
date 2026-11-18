/* eslint-disable @stylistic/js/max-len */
export const overlayConfig = {
  US: [
    {tags: ['00100010', '00100040'], pos: 'tl', format: '{v0} [{v1}]'},
    {tags: ['00100030'], pos: 'tl'},

    {tags: ['00080070', '00081090'], pos: 'tr', format: '{v0} {v1}'},
    {tags: ['00080020', '00080030'], pos: 'tr', format: '{v0} {v1}'},
    {tags: ['00080060'], pos: 'tr'},

    {event: 'wlchange', pos: 'bl', format: 'WC: {v0}', precision: 'round'},
    {event: 'wlchange', pos: 'bl', format: 'WW: {v1}', precision: 'round'},

    {event: 'zoomchange', pos: 'br', format: 'Z: {v0}', precision: '3'},
    {event: 'offsetchange', pos: 'br', format: 'Off: {v0},{v1}', precision: 'round'},
    {event: 'positionchange', pos: 'br', format: 'Pos: {v0}'},
    {event: 'positionchange', pos: 'br', format: 'Value: {v2}'}
  ],
  DOM: [
    {tags: ['fileName'], pos: 'tl'},

    {tags: ['fileType'], pos: 'tr'},

    {tags: ['imageWidth', 'imageHeight'], pos: 'bl', format: 'RES: {v0}x{v1}'},

    {event: 'wlchange', pos: 'bl', format: 'WC: {v0}'},
    {event: 'wlchange', pos: 'bl', format: 'WW: {v1}'},

    {event: 'zoomchange', pos: 'br', format: 'Z: {v0}', precision: '3'},
    {event: 'offsetchange', pos: 'br', format: 'Off: {v0},{v1}', precision: 'round'},
    {event: 'positionchange', pos: 'br', format: 'Pos: {v0}'},
    {event: 'positionchange', pos: 'br', format: 'Value: {v1}'}
  ],
  '*': [
    {tags: ['00100010', '00100040'], pos: 'tl', format: '{v0} [{v1}]'},
    {tags: ['00100030'], pos: 'tl'},

    {tags: ['00080070', '00081090'], pos: 'tr', format: '{v0} {v1}'},
    {tags: ['00080020', '00080030'], pos: 'tr', format: '{v0} {v1}'},
    {tags: ['00080060'], pos: 'tr'},

    {event: 'wlchange', pos: 'bl', format: 'WC: {v0}', precision: 'round'},
    {event: 'wlchange', pos: 'bl', format: 'WW: {v1}', precision: 'round'},

    {event: 'zoomchange', pos: 'br', format: 'Z: {v0}', precision: '3'},
    {event: 'offsetchange', pos: 'br', format: 'Off: {v0},{v1}', precision: 'round'},
    {event: 'positionchange', pos: 'br', format: 'Pos: {v0}'},
    {event: 'positionchange', pos: 'br', format: 'Value: {v2}'}
  ]
};
/* eslint-enable @stylistic/js/max-len */

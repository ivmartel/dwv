// namespace
// eslint-disable-next-line no-var
var dcmb = dcmb || {};
dcmb.utils = dcmb.utils || {};

// Class to handle running functions.
dcmb.DataRunner = function () {

  // closure to self
  const self = this;

  // data list
  let dataList = null;
  // function runner
  let functionRunner = null;

  // current data index
  let dataIndex = 0;

  // result array
  let results = null;

  // status
  let status = 'ready';

  /**
   * Listener handler.
   *
   * @type {object}
   */
  const listenerHandler = new dcmb.utils.ListenerHandler();

  // Get the status.
  this.getStatus = function () {
    return status;
  };

  // Get the results.
  this.getResults = function () {
    return results;
  };

  // Get the data header.
  this.getDataHeader = function () {
    const header = [];
    for (let i = 0; i < dataList.length; ++i) {
      header.push(dataList[i].name);
    }
    return header;
  };

  // Set the data list.
  this.setDataList = function (list) {
    if (list.length === 0) {
      throw new Error('Empty list provided.');
    }
    dataList = list;
  };

  // Set the function runner.
  this.setFunctionRunner = function (runner) {
    functionRunner = runner;
  };

  /**
   * Set the status.
   *
   * @private
   * @param {string} newStatus The new status.
   */
  function setStatus(newStatus) {
    status = newStatus;
    fireEvent({type: 'status-change', value: status});
  }

  // Cancel the process.
  this.cancel = function () {
    setStatus('cancelling');
  };

  /**
   * Run the process: load the data and pass it to the function runner.
   */
  this.run = function () {
    // reset results
    if (dataIndex === 0) {
      results = [];
    }

    // current data
    const data = dataList[dataIndex];

    // console output
    console.log('Launch with: \'' + data.name + '\'');
    // status
    setStatus('running');

    // read according to type
    if (typeof data.file === 'undefined') {
      // XMLHttpRequest
      const request = new XMLHttpRequest();
      request.open('GET', data.url, true);
      request.responseType = 'arraybuffer';
      request.onload = function (/*event*/) {
        onloadBuffer(this.response);
      };
      request.send(null);
    } else {
      // FileReader
      const reader = new FileReader();
      reader.onload = function (event) {
        onloadBuffer(event.target.result);
      };
      reader.readAsArrayBuffer(data.file);
    }
  };

  /**
   * Handle loaded data. Once done call another run or stop.
   *
   * @param {object} buffer The data buffer.
   */
  function onloadBuffer(buffer) {

    // call the runner and store the results
    results.push(functionRunner.run(buffer));

    // check status
    if (self.getStatus() !== 'cancelled') {
      // launch next
      ++dataIndex;
      if (dataIndex < dataList.length) {
        self.run();
      } else {
        dataIndex = 0;
        setStatus('done');
      }
    }
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };
  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };
  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

};

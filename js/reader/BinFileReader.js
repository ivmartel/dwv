/**
 * BinFileReader.js
 * You can find more about this function at
 * http://nagoon97.com/reading-binary-files-using-ajax/
 *
 * Copyright (c) 2008 Andy G.P. Na <nagoon97@naver.com>
 * The source code is freely distributable under the terms of an MIT-style license.
 */
function BinFileReader(fileURL){
	var _exception = {};
	_exception.FileLoadFailed = 1;
	_exception.EOFReached = 2;

	var filePointer = 0;
	var fileSize = -1;
	var fileContents;

	this.getFileSize = function(){
		return fileSize;
	};

	this.getFilePointer = function(){
		return filePointer;
	};
	this.readBytes=function()
	{
		return fileContents;
	};
	this.movePointerTo = function(iTo){
		if(iTo < 0) filePointer = 0;
		else if(iTo > this.getFileSize()) throwException(_exception.EOFReached);
		else filePointer = iTo;

		return filePointer;
	};

	this.movePointer = function(iDirection){
		this.movePointerTo(filePointer + iDirection);

		return filePointer;
	};

	this.readNumber = function(iNumBytes, iFrom){
		iNumBytes = iNumBytes || 1;
		iFrom = iFrom || filePointer;

		this.movePointerTo(iFrom + iNumBytes);

		var result = 0;
		for(var i=iFrom + iNumBytes; i>iFrom; i--){
			result = result * 256 + this.readByteAt(i-1);
		}

		return result;
	};

	this.readString = function(iNumChars, iFrom){
		iNumChars = iNumChars || 1;
		iFrom = iFrom || filePointer;

		this.movePointerTo(iFrom);

		var result = "";
		var tmpTo = iFrom + iNumChars;
		for(var i=iFrom; i<tmpTo; i++){
			result += String.fromCharCode(this.readNumber(1));
		}

		return result;
	};

	this.readUnicodeString = function(iNumChars, iFrom){
		iNumChars = iNumChars || 1;
		iFrom = iFrom || filePointer;

		this.movePointerTo(iFrom);

		var result = "";
		var tmpTo = iFrom + iNumChars*2;
		for(var i=iFrom; i<tmpTo; i+=2){
			result += String.fromCharCode(this.readNumber(2));
		}

		return result;
	};

	function throwException(errorCode){
		switch(errorCode){
			case _exception.FileLoadFailed:
				throw new Error('Error: Filed to load "'+fileURL+'"');
				break;
			case _exception.EOFReached:
				throw new Error("Error: EOF reached");
				break;
		}
	}

	function BinFileReaderImpl_IE(fileURL){
		var vbArr = BinFileReaderImpl_IE_VBAjaxLoader(fileURL);
		fileContents = vbArr.toArray();

		fileSize = fileContents.length-1;

		if(fileSize < 0) throwException(_exception.FileLoadFailed);

		this.readByteAt = function(i){
			return fileContents[i];
		};
	}
	
	function BinFileReaderImpl(fileURL){
		
        var req = new XMLHttpRequest();

		req.open('GET', fileURL, false);

		//XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com] 
		req.overrideMimeType('text/plain; charset=x-user-defined');
		req.send(null);

		if (req.status != 200) throwException(_exception.FileLoadFailed);
		{			
		fileContents = req.responseText;
		}		
		fileSize = fileContents.length;
		this.readByteAt = function(i){
			return fileContents.charCodeAt(i) & 0xff;
		};
	}
	if(/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent))
		BinFileReaderImpl_IE.apply(this, [fileURL]);
	else
		BinFileReaderImpl.apply(this, [fileURL]);
}

/*
// to add in the index.html
<script type="text/vbscript">
Function BinFileReaderImpl_IE_VBAjaxLoader(fileName)
    Dim xhr
    Set xhr = CreateObject("Microsoft.XMLHTTP")
    xhr.Open "GET", fileName, False
    xhr.setRequestHeader "Accept-Charset", "x-user-defined"
    xhr.send
    Dim byteArray()
    if xhr.Status = 200 Then
        Dim byteString
        Dim i
        byteString=xhr.responseBody
        ReDim byteArray(LenB(byteString))
        For i = 1 To LenB(byteString)
            byteArray(i-1) = AscB(MidB(byteString, i, 1))
        Next
    End If
    BinFileReaderImpl_IE_VBAjaxLoader=byteArray
End Function
</script>
*/
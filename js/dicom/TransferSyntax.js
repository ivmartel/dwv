/**
 *  TransferSyntax.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */
function TransferSyntax()
{    
    this.ImplicitVRLittleEndian =new TransferSyntax("1.2.840.10008.1.2", false, false, false, false);

    this.ImplicitVRBigEndian = new TransferSyntax(null, false, true, false, false);

    this.ExplicitVRLittleEndian =
            new TransferSyntax("1.2.840.10008.1.2.1", true, false, false, false);

    this.ExplicitVRBigEndian = 
            new TransferSyntax("1.2.840.10008.1.2.2", true, true, false, false);

    this.DeflatedExplicitVRLittleEndian = 
            new TransferSyntax("1.2.840.10008.1.2.1.99", true, false, true, false);
    this.init= initializer;
    this.uid=function()
    {
        return this._uid;
    };
    this.bigEndian=function()
    {
        return this._bigEndian;
    };

    this.explicitVR=function()
    {
        return this._explicitVR;
    };

    this.deflated=function()
    {
        return this._deflated;
    };

    this.encapsulated=function()
    {
        return this._encapsulated;
    };

    this.uncompressed=function()
    {
        return !this._deflated && !this._encapsulated;
    }; 
    this.valueOf=function(uid)
    {
        if (uid == null) {
            throw new Error("uid");
        }
        if (uid ==ImplicitVRLittleEndian._uid) {
            return ImplicitVRLittleEndian;
        }
        if (uid==ExplicitVRLittleEndian._uid) {
            return ExplicitVRLittleEndian;
        }
        if (uid ==ExplicitVRBigEndian._uid) {
            return ExplicitVRBigEndian;
        }
        if (uid ==DeflatedExplicitVRLittleEndian._uid) {
            return DeflatedExplicitVRLittleEndian;
        }
        return new TransferSyntax(uid, true, false, false, true);
    };
}
function initializer(uid,explicitVR,bigEndian,deflated,encapsulated)
{
    _uid = uid;
   _explicitVR = explicitVR;
    _bigEndian = bigEndian;
   _deflated = deflated;
    _encapsulated = encapsulated;
}




pragma solidity ^0.4.19;

contract ISigner {

    function validate(bytes32 hash, bytes signature)
        public view
        returns (bool valid);

}

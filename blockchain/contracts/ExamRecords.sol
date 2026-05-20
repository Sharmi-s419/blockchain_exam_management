// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExamRecords {
    struct Record {
        uint256 userId;
        uint256 examId;
        string scoreHash;
        uint256 timestamp;
    }

    mapping(uint256 => Record[]) public examRecords;

    event RecordAdded(uint256 indexed userId, uint256 indexed examId, string scoreHash, uint256 timestamp);

    function addRecord(uint256 _userId, uint256 _examId, string memory _scoreHash) public {
        Record memory newRecord = Record({
            userId: _userId,
            examId: _examId,
            scoreHash: _scoreHash,
            timestamp: block.timestamp
        });
        examRecords[_examId].push(newRecord);

        emit RecordAdded(_userId, _examId, _scoreHash, block.timestamp);
    }
}

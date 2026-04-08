// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public admin;
    string public electionTitle;

    uint public electionStartTime;
    uint public electionEndTime;

    bool public electionStarted;
    bool public electionEnded;

    uint public candidatesCount;

    struct Candidate {
        uint id;
        string name;
        string party;
        string manifesto;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    modifier electionActive() {
        require(electionStarted, "Election not started");
        require(!electionEnded, "Election ended");
        require(block.timestamp >= electionStartTime, "Too early");
        require(block.timestamp <= electionEndTime, "Too late");
        _;
    }

    constructor() {
        admin = msg.sender;
        electionTitle = "UEL Blockchain Election";
    }

    function configureElection(
        string memory _title,
        uint _start,
        uint _end
    ) public onlyAdmin {
        require(!electionStarted, "Already started");

        electionTitle = _title;
        electionStartTime = _start;
        electionEndTime = _end;
    }

    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _manifesto
    ) public onlyAdmin {
        require(!electionStarted, "Cannot add after start");

        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            _party,
            _manifesto,
            0
        );
    }

    function registerVoter(address _voter) public onlyAdmin {
        voters[_voter] = Voter(true, false);
    }

    function startElection() public onlyAdmin {
        require(candidatesCount > 1, "Need at least 2 candidates");
        electionStarted = true;
    }

    function vote(uint _candidateId) public electionActive {
        require(voters[msg.sender].isRegistered, "Not registered");
        require(!voters[msg.sender].hasVoted, "Already voted");

        voters[msg.sender].hasVoted = true;
        candidates[_candidateId].voteCount++;
    }

    function endElection() public onlyAdmin {
        electionEnded = true;
    }

    function getElectionStatus() public view returns (string memory) {
        if (!electionStarted) return "Not Started";
        if (electionEnded) return "Ended";
        if (block.timestamp < electionStartTime) return "Scheduled";
        return "Active";
    }

    function getCandidate(uint _id)
        public
        view
        returns (
            uint,
            string memory,
            string memory,
            string memory,
            uint
        )
    {
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.party, c.manifesto, c.voteCount);
    }
}
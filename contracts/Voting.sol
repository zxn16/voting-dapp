// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;

contract Voting {
    enum State {
        NotStarted,
        InProgress,
        Ended
    }

    struct Candidate {
        uint256 id;
        string name;
        string party;
        string manifesto;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    address public admin;
    State public electionState;

    string public electionTitle;
    uint256 public electionStartDate;
    uint256 public electionEndDate;

    mapping(uint256 => Candidate) private candidates;
    mapping(address => Voter) public voters;

    uint256 public candidatesCount = 0;

    constructor() {
        admin = msg.sender;
        electionState = State.NotStarted;
    }

    event ElectionConfigured(
        string title,
        uint256 startDate,
        uint256 endDate
    );

    event CandidateAdded(
        uint256 indexed candidateId,
        string name,
        string party,
        string manifesto
    );

    event VoterAdded(address indexed voterAddress);
    event ElectionStarted();
    event ElectionEnded();
    event Voted(uint256 indexed candidateId, address indexed voter);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function configureElection(
        string memory _title,
        uint256 _startDate,
        uint256 _endDate
    ) public onlyAdmin {
        require(
            electionState == State.NotStarted,
            "Election already started or ended"
        );
        require(bytes(_title).length > 0, "Election title is required");
        require(_startDate > 0, "Start date is required");
        require(_endDate > _startDate, "End date must be after start date");

        electionTitle = _title;
        electionStartDate = _startDate;
        electionEndDate = _endDate;

        emit ElectionConfigured(_title, _startDate, _endDate);
    }

    function startElection() public onlyAdmin {
        require(electionState == State.NotStarted, "Election already started");
        require(bytes(electionTitle).length > 0, "Configure election first");
        require(candidatesCount > 0, "Add at least one candidate first");

        electionState = State.InProgress;
        emit ElectionStarted();
    }

    function endElection() public onlyAdmin {
        require(electionState == State.InProgress, "Election is not active");
        electionState = State.Ended;
        emit ElectionEnded();
    }

    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _manifesto
    ) public onlyAdmin {
        require(
            electionState == State.NotStarted,
            "Cannot add candidate after election starts"
        );
        require(bytes(_name).length > 0, "Candidate name is required");

        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            _party,
            _manifesto,
            0
        );

        emit CandidateAdded(candidatesCount, _name, _party, _manifesto);
        candidatesCount++;
    }

    function addVoter(address _voter) public onlyAdmin {
        require(
            electionState == State.NotStarted,
            "Cannot add voter after election starts"
        );
        require(_voter != address(0), "Invalid voter address");
        require(!voters[_voter].isRegistered, "Voter already registered");

        voters[_voter] = Voter(true, false);
        emit VoterAdded(_voter);
    }

    function getRole(address _current) public view returns (uint256) {
        if (_current == admin) {
            return 1;
        } else if (voters[_current].isRegistered) {
            return 2;
        } else {
            return 3;
        }
    }

    function vote(uint256 _candidateId) public {
        require(
            electionState == State.InProgress,
            "Election is not in progress"
        );
        require(voters[msg.sender].isRegistered, "You are not a registered voter");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId < candidatesCount, "Invalid candidate ID");

        candidates[_candidateId].voteCount++;
        voters[msg.sender].hasVoted = true;

        emit Voted(_candidateId, msg.sender);
    }

    function getCandidateDetails(uint256 _candidateId)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        require(_candidateId < candidatesCount, "Invalid candidate ID");

        Candidate memory candidate = candidates[_candidateId];
        return (
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.manifesto,
            candidate.voteCount
        );
    }

    function getElectionDetails()
        public
        view
        returns (
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            electionTitle,
            electionStartDate,
            electionEndDate,
            uint256(electionState)
        );
    }
}
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const hre = require("hardhat");

describe("Escrow", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployEscrowFixture() {
    const deposit = hre.ethers.parseEther("1");
    const status = {
      Deposited: 0,
      Disputed: 1,
      Approved: 2,
      Cancelled: 3,
    };

    // Contracts are deployed using the first signer/account by default
    const [arbiter, beneficiary, depositor] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();

    return { escrow, arbiter, beneficiary, depositor, deposit, status };
  }

  describe("Deployment", function () {
    it("Should set the right arbiter", async function () {
      const { escrow, arbiter } = await loadFixture(deployEscrowFixture);

      expect(await escrow.arbiter()).to.equal(arbiter.address);
    });
  });

  describe("createEscrow", function () {
    describe("Validations", function () {
      it("Should increase the number of escrows", async function () {
        const { escrow, beneficiary, deposit, depositor } = await loadFixture(
          deployEscrowFixture
        );

        const initialNumber = await escrow.escrowsNo();
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        expect(await escrow.escrowsNo()).to.equal(Number(initialNumber) + 1);
      });
    });
    describe("Events", function () {
      it("Should emit an event on creation", async function () {
        const { escrow, beneficiary, deposit, depositor } = await loadFixture(
          deployEscrowFixture
        );

        await expect(
          escrow.connect(depositor).createEscrow(beneficiary, {
            value: deposit,
          })
        )
          .to.emit(escrow, "EscrowCreated")
          .withArgs(depositor.address, beneficiary.address, deposit); // We accept any value as `when` arg
      });
    });
  });

  describe("getEscrow", function () {
    it("Should return a valid escrow with valid id", async function () {
      const { escrow, beneficiary, deposit, depositor } = await loadFixture(
        deployEscrowFixture
      );
      await escrow
        .connect(depositor)
        .createEscrow(beneficiary, { value: deposit });
      expect((await escrow.getEscrow(1))[0]).to.equal(beneficiary.address);
    });

    it("Should return an invalid escrow with invalid id", async function () {
      const { escrow, beneficiary, deposit, depositor } = await loadFixture(
        deployEscrowFixture
      );
      await escrow
        .connect(depositor)
        .createEscrow(beneficiary, { value: deposit });
      expect((await escrow.getEscrow(0))[0]).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
    });
  });

  describe("dispute", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { escrow, beneficiary, depositor, deposit } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await expect(escrow.connect(beneficiary).dispute(1)).to.be.revertedWith(
          "Unauthorized caller"
        );
      });

      it("Should revert with the right error if escrow status is approved", async function () {
        const { escrow, beneficiary, depositor, deposit } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).approve(1);
        await expect(escrow.connect(depositor).dispute(1)).to.be.revertedWith(
          "Escrow can no longer be disputed"
        );
      });

      it("Should revert with the right error if escrow status is disputed", async function () {
        const { escrow, beneficiary, depositor, deposit } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).dispute(1);
        await expect(escrow.connect(depositor).dispute(1)).to.be.revertedWith(
          "Escrow can no longer be disputed"
        );
      });
    });
    describe("Events", function () {
      it("Should emit an event on dispute", async function () {
        const { escrow, beneficiary, deposit, depositor } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });

        await expect(escrow.connect(depositor).dispute(1))
          .to.emit(escrow, "Disputed")
          .withArgs(1); // We accept any value as `when` arg
      });
    });
  });

  describe("approve", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { escrow, beneficiary, depositor, deposit } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await expect(escrow.connect(beneficiary).approve(1)).to.be.revertedWith(
          "Unauthorized caller"
        );
      });

      it("Should revert with the right error if escrow status is approved", async function () {
        const { escrow, beneficiary, depositor, deposit } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).approve(1);
        await expect(escrow.connect(depositor).approve(1)).to.be.revertedWith(
          "Escrow can no longer be approved"
        );
      });

      it("Should revert with the right error if escrow status is disputed", async function () {
        const { escrow, beneficiary, depositor, deposit } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).dispute(1);
        await expect(escrow.connect(depositor).approve(1)).to.be.revertedWith(
          "Escrow can no longer be approved"
        );
      });
      it("Should transfer escrow amount to beneficiary", async function () {
        const { escrow, beneficiary, depositor, deposit } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await expect(
          escrow.connect(depositor).approve(1)
        ).to.changeEtherBalances([beneficiary, escrow], [deposit, -deposit]);
      });
    });
    describe("Events", function () {
      it("Should emit an event on approve", async function () {
        const { escrow, beneficiary, deposit, depositor } = await loadFixture(
          deployEscrowFixture
        );
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });

        await expect(escrow.connect(depositor).approve(1))
          .to.emit(escrow, "Approved")
          .withArgs(1); // We accept any value as `when` arg
      });
    });
  });

  describe("handleDispute", function () {
    describe("Validations", function () {
      it("Should revert with the right error if not called by arbiter", async function () {
        const { escrow, beneficiary, depositor, deposit, status } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).dispute(1);
        await expect(
          escrow.connect(beneficiary).handleDispute(1, status.Approved)
        ).to.be.revertedWith("Unauthorized caller");
      });

      it("Should revert with the right error if not called with valid status parameter", async function () {
        const { escrow, beneficiary, depositor, deposit, status, arbiter } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).dispute(1);
        await expect(
          escrow.connect(arbiter).handleDispute(1, status.Disputed)
        ).to.be.revertedWith("Invalid status");
      });

      it("Should revert with the right error if escrow status is approved", async function () {
        const { escrow, beneficiary, depositor, deposit, arbiter, status } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).approve(1);
        await expect(
          escrow.connect(arbiter).handleDispute(1, status.Approved)
        ).to.be.revertedWith("Escrow can no longer be handled");
      });

      it("Should revert with the right error if escrow status is deposited", async function () {
        const { escrow, beneficiary, depositor, deposit, arbiter, status } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await expect(
          escrow.connect(arbiter).handleDispute(1, status.Approved)
        ).to.be.revertedWith("Escrow can no longer be handled");
      });

      it("Should transfer escrow amount to beneficiary if status param is approved", async function () {
        const { escrow, beneficiary, depositor, deposit, arbiter, status } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).dispute(1);
        await expect(
          escrow.connect(arbiter).handleDispute(1, status.Approved)
        ).to.changeEtherBalances([beneficiary, escrow], [deposit, -deposit]);
      });

      it("Should transfer escrow amount to depositor if status param is cancelled", async function () {
        const { escrow, beneficiary, depositor, deposit, arbiter, status } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });
        await escrow.connect(depositor).dispute(1);
        await expect(
          escrow.connect(arbiter).handleDispute(1, status.Cancelled)
        ).to.changeEtherBalances([depositor, escrow], [deposit, -deposit]);
      });
    });
    describe("Events", function () {
      it("Should emit Approved event when approve status param is passed", async function () {
        const { escrow, beneficiary, deposit, depositor, arbiter, status } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });

        await escrow.connect(depositor).dispute(1);

        await expect(escrow.connect(arbiter).handleDispute(1, status.Approved))
          .to.emit(escrow, "Approved")
          .withArgs(1); // We accept any value as `when` arg
      });

      it("Should emit Cancelled event when cancelled status param is passed", async function () {
        const { escrow, beneficiary, deposit, depositor, arbiter, status } =
          await loadFixture(deployEscrowFixture);
        await escrow
          .connect(depositor)
          .createEscrow(beneficiary, { value: deposit });

        await escrow.connect(depositor).dispute(1);

        await expect(escrow.connect(arbiter).handleDispute(1, status.Cancelled))
          .to.emit(escrow, "Cancelled")
          .withArgs(1); // We accept any value as `when` arg
      });
    });
  });
});

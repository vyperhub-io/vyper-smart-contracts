const vyperStorage = artifacts.require('vyperStorage');

contract('vyperStorage', () => {
  it('...should initialize storage with 0.', async () => {
    const storage = await vyperStorage.deployed();

    const storedData = await storage.stored_data();

    assert.equal(
      storedData,
      0,
      'The value 89 was not stored.'
    );
  });

  it('...should store the value 89.', async () => {
    const storage = await vyperStorage.deployed();

    await storage.set(89);

    const storedData = await storage.stored_data();

    assert.equal(
      storedData,
      89,
      'The value 89 was not stored.'
    );
  });
});

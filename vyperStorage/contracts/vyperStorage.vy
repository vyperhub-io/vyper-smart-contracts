stored_data: public(uint256)

@public
def __init__():
    self.stored_data = 0

@public
def set(new_value: uint256):
    self.stored_data = new_value

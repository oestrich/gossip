defmodule GrapevineSocket.Web.RequestTest do
  use ExUnit.Case

  alias GrapevineSocket.Web.Request
  alias GrapevineSocket.Web.State

  describe "checks for supports" do
    test "support flag is present" do
      state = %State{supports: ["channels"]}
      assert {:ok, :support_present} = Request.check_support_flag(state, "channels")
    end

    test "support flag is not present" do
      state = %State{supports: ["channels"]}
      assert {:error, :support_missing} = Request.check_support_flag(state, "players")
    end
  end
end

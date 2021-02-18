defmodule GrapevineTelnet.Features do
  @moduledoc """
  Struct and functions for tracking Telnet option statuses
  """

  defstruct gmcp: false, packages: [], messages: [], message_cache: %{}

  @doc """
  Enable GMCP on the telnet state
  """
  def enable_gmcp(state) do
    features = Map.put(state.features, :gmcp, true)
    Map.put(state, :features, features)
  end

  @doc """
  Add GMCP packages to the feature set
  """
  def packages(state, packages) do
    packages =
      Enum.map(packages, fn package ->
        List.first(String.split(package, " "))
      end)

    packages = Map.get(state.features, :packages) ++ packages
    packages = Enum.uniq(packages)
    features = Map.put(state.features, :packages, packages)
    Map.put(state, :features, features)
  end

  @doc """
  Check if a GMCP message is enabled and can be forwarded
  """
  def message_enabled?(%{features: features}, message) do
    message in features.messages
  end

  @doc """
  Cache the message for repeating to a reloaded browser
  """
  def cache_message(state, message, data)

  def cache_message(state, "Client.Media.Default", data) do
    force_cache_message(state, "Client.Media.Default", data)
  end

  def cache_message(state, "Client.Media" <> _, _data), do: state

  def cache_message(state, "Client.Modals" <> _, _data), do: state

  def cache_message(state, message, data), do: force_cache_message(state, message, data)

  defp force_cache_message(state, message, data) do
    cache = Map.put(state.features.message_cache, message, data)
    features = Map.put(state.features, :message_cache, cache)
    Map.put(state, :features, features)
  end

  @doc """
  Load all of the supported packages that the client should turn on
  """
  def supported_packages(%{game: game}) when game != nil do
    gauge_packages = Enum.map(game.gauges, & &1.package)

    Enum.uniq(gauge_packages ++ client_setting_packages(game) ++ base_packages())
  end

  def supported_packages(_), do: []

  defp client_setting_packages(%{client_settings: client_settings}) do
    character_package = Map.get(client_settings, :character_package)

    case is_nil(character_package) do
      true ->
        []

      false ->
        [character_package]
    end
  end

  defp client_setting_packages(_), do: []

  @doc """
  Load all of the supported packages that the client should turn on
  """
  def cache_supported_messages(state = %{game: game}) when game != nil do
    messages =
      game.gauges
      |> Enum.map(& &1.message)
      |> Enum.uniq()

    messages = messages ++ base_messagse()
    features = Map.put(state.features, :messages, messages)
    Map.put(state, :features, features)
  end

  def cache_supported_messages(state), do: state

  @doc """
  Base packages that the client will try to turn on
  """
  def base_packages(), do: ["Client.Modals 1", "Client.Media 1"]

  @doc """
  Base messages that are known for the client
  """
  def base_messagse() do
    [
      "Client.Modals.Open",
      "Client.Media.Default",
      "Client.Media.Load",
      "Client.Media.Play",
      "Client.Media.Stop"
    ]
  end
end

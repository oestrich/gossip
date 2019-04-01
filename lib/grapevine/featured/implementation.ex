defmodule Grapevine.Featured.Implementation do
  @moduledoc """
  Implementation details for the Featured GenServer
  """

  import Ecto.Query

  alias Grapevine.Games
  alias Grapevine.Repo

  @doc """
  Calculate the delay to the next cycle check which runs at 6 AM UTC
  """
  def calculate_next_cycle_delay(now) do
    now
    |> Timex.set([hour: 6, minute: 0, second: 0])
    |> maybe_shift_a_day(now)
    |> Timex.diff(now, :milliseconds)
  end

  defp maybe_shift_a_day(next_run, now) do
    case Timex.before?(now, next_run) do
      true ->
        next_run

      false ->
        Timex.shift(next_run, days: 1)
    end
  end

  @doc """
  Select the featured games for that day
  """
  def select_featured() do
    Ecto.Multi.new()
    |> reset_all()
    |> update_selected()
    |> Repo.transaction()
  end

  defp reset_all(multi) do
    Ecto.Multi.update_all(multi, :update_all, Grapevine.Games.Game, set: [featured_order: nil])
  end

  defp update_selected(multi) do
    featured_games()
    |> Enum.with_index()
    |> Enum.reduce(multi, fn {game, order}, multi ->
      changeset =
        game
        |> Ecto.Changeset.change()
        |> Ecto.Changeset.put_change(:featured_order, order)

      Ecto.Multi.update(multi, {:game, game.id}, changeset)
    end)
  end

  def featured_games() do
    top_games = top_games_player_count([])
    selected_ids = Enum.map(top_games, & &1.id)

    random_games_using = random_games_using_grapevine(already_picked: selected_ids)
    selected_ids = selected_ids ++ Enum.map(random_games_using, & &1.id)

    random_games = random_games(already_picked: selected_ids)

    Enum.shuffle(top_games ++ random_games_using ++ random_games)
  end

  def top_games_player_count(opts) do
    last_few_days =
      Timex.now()
      |> Timex.shift(days: -2)
      |> Timex.set(minute: 0, second: 0)
      |> DateTime.truncate(:second)

    limit = Keyword.get(opts, :select, 12)

    Grapevine.Statistics.PlayerStatistic
    |> select([ps], ps.game_id)
    |> where([ps], ps.recorded_at >= ^last_few_days)
    |> group_by([ps], [ps.game_id])
    |> order_by([ps], desc: avg(ps.player_count))
    |> limit(^limit)
    |> Repo.all()
    |> Enum.map(fn game_id ->
      {:ok, game} = Games.get(game_id)
      game
    end)
  end

  def random_games_using_grapevine(opts) do
    active_cutoff = Timex.now() |> Timex.shift(minutes: -1)
    mssp_cutoff = Timex.now() |> Timex.shift(minutes: -90)

    limit = Keyword.get(opts, :select, 4)
    already_picked_games = Keyword.get(opts, :already_picked, [])

    Grapevine.Games.Game
    |> where([g], g.last_seen_at > ^active_cutoff or g.mssp_last_seen_at > ^mssp_cutoff)
    |> where([g], g.id not in ^already_picked_games)
    |> Repo.all()
    |> Enum.shuffle()
    |> Enum.take(limit)
  end

  def random_games(opts) do
    limit = Keyword.get(opts, :select, 4)
    already_picked_games = Keyword.get(opts, :already_picked, [])

    Grapevine.Games.Game
    |> where([g], g.id not in ^already_picked_games)
    |> Repo.all()
    |> Enum.shuffle()
    |> Enum.take(limit)
  end
end
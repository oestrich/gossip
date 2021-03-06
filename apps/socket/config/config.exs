import Config

config :grapevine_socket, ecto_repos: [GrapevineData.Repo]
config :grapevine_socket, :pubsub, start: true
config :grapevine_socket, :errors, report: false

config :phoenix, :json_library, Jason

config :porcelain, driver: Porcelain.Driver.Basic

if File.exists?("config/#{Mix.env()}.exs") do
  import_config "#{Mix.env()}.exs"
end

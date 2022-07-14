
defmodule SequenceWeb.ProjectsView do
  use SequenceWeb, :view

  def render_project(project, _user) do
    %{
      id: project.uuid,
      name: project.name,
    }
  end

  def render("list.json", %{projects: projects, user: user}) do
    %{
      user: SequenceWeb.AuthView.render_user(user),
      projects: projects |> Enum.map(&render_project(&1, user)),
    }
  end

  def render("get.json", %{project: project, user: user}) do
    %{
      project: render_project(project, user)
    }
  end

end
